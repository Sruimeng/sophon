import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import { getEngine } from './engine';
import type { TokenCandidate, InferenceMetrics } from '~/types/inference';

/**
 * Decode byte-level BPE tokens to readable UTF-8 string.
 * Handles tokens like "Ġ" (space prefix) and raw byte sequences.
 */
function decodeToken(token: string): string {
  const BYTE_DECODER: Record<string, string> = {
    'Ġ': ' ', 'Ċ': '\n', 'ĉ': '\t',
  };

  let result = '';
  for (const char of token) {
    if (BYTE_DECODER[char]) {
      result += BYTE_DECODER[char];
    } else {
      const code = char.charCodeAt(0);
      if (code >= 0x100 && code <= 0x1FF) {
        result += String.fromCharCode(code - 0x100);
      } else {
        result += char;
      }
    }
  }

  try {
    const bytes = new Uint8Array([...result].map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (/^[\x20-\x7E\u4e00-\u9fff\u3000-\u303f]+$/.test(decoded)) {
      return decoded;
    }
  } catch {
    // Not valid UTF-8 sequence
  }

  return result.replace(/[^\x20-\x7E\u4e00-\u9fff\u3000-\u303f]/g, '');
}

export interface GenerateOptions {
  prompt: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  tokenDelay?: number;
  onToken?: (token: string, tokenId: number, candidates: TokenCandidate[]) => void;
}

export interface GenerateResult {
  text: string;
  tokenCount: number;
  metrics: InferenceMetrics;
}

export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const engine = getEngine();

  if (!engine) {
    throw new Error('Engine not initialized');
  }

  const { prompt, temperature = 0.7, topP = 0.9, maxTokens = 256, tokenDelay = 0, onToken } = options;

  const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: prompt }];

  let fullText = '';
  let tokenCount = 0;
  const startTime = performance.now();

  // Get GPU info
  let gpuVendor: string | undefined;
  let maxBufferSize: number | undefined;
  try {
    gpuVendor = await engine.getGPUVendor();
    maxBufferSize = await engine.getMaxStorageBufferBindingSize();
  } catch {
    // GPU info not available
  }

  const response = await engine.chat.completions.create({
    messages,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    stream: true,
    logprobs: true,
    top_logprobs: 5,
    stream_options: { include_usage: true },
  });

  let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

  for await (const chunk of response) {
    const choice = chunk.choices[0];
    const delta = choice?.delta?.content;

    // Capture usage from final chunk
    if (chunk.usage) {
      usage = chunk.usage;
    }

    if (delta) {
      fullText += delta;
      tokenCount++;

      let candidates: TokenCandidate[] = [];
      const logprobs = choice?.logprobs;

      if (logprobs?.content?.[0]?.top_logprobs) {
        candidates = logprobs.content[0].top_logprobs
          .map((lp) => ({
            token: decodeToken(lp.token),
            probability: Math.exp(lp.logprob),
            tokenId: 0,
          }))
          .filter((c) => c.token.length > 0);
      }

      onToken?.(delta, tokenCount, candidates);

      if (tokenDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, tokenDelay));
      }
    }
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  const metrics: InferenceMetrics = {
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? tokenCount,
    totalTokens: usage?.total_tokens ?? tokenCount,
    decodeTime: totalTime,
    tokensPerSecond: tokenCount / (totalTime / 1000),
    gpuVendor,
    maxBufferSize,
  };

  console.log('[generate] Completed:', tokenCount, 'tokens in', totalTime.toFixed(0), 'ms');
  return { text: fullText, tokenCount, metrics };
}
