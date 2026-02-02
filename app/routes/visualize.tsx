import { useEffect } from 'react';
import { WebGPUGuard } from '~/components/shared/WebGPUGuard';
import { Scene } from '~/components/visualization/Scene';
import { LayerTabs } from '~/components/controls/LayerTabs';
import { SamplingSlider } from '~/components/controls/SamplingSlider';
import { ProbabilityProgress } from '~/components/controls/ProbabilityProgress';
import { useInferenceStore } from '~/store/inference';
import { generateAllLayersAttention } from '~/lib/webllm/inference';

export default function Visualize() {
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const generatedText = useInferenceStore((s) => s.generatedText);
  const candidates = useInferenceStore((s) => s.candidates);
  const metrics = useInferenceStore((s) => s.metrics);
  const addAttentionWeights = useInferenceStore((s) => s.addAttentionWeights);

  const allTokens = [...tokens, ...generatedTokens];

  useEffect(() => {
    if (allTokens.length === 0) return;

    console.log('[Visualize] Generating attention for', allTokens.length, 'tokens');
    const weights = generateAllLayersAttention(allTokens.length);
    addAttentionWeights(weights);
  }, [allTokens.length, addAttentionWeights]);

  // Candidates are now set by real logprobs from generate()

  return (
    <WebGPUGuard>
      <div className="relative h-screen w-screen bg-obsidian-100">
        <Scene />

        <div className="absolute top-4 right-4 flex flex-col gap-4 max-w-md">
          <div className="rounded-lg bg-slate-900/80 p-4 text-sm text-white space-y-2">
            <div className="font-medium text-core-blue">Input Tokens ({tokens.length})</div>
            <div className="flex flex-wrap gap-1">
              {tokens.map((t) => (
                <span key={`input-${t.position}`} className="rounded bg-blue-600/30 px-2 py-0.5">
                  {t.text}
                </span>
              ))}
            </div>

            {generatedTokens.length > 0 && (
              <>
                <div className="font-medium text-green-400 mt-3">Generated ({generatedTokens.length})</div>
                <div className="flex flex-wrap gap-1">
                  {generatedTokens.map((t) => (
                    <span key={`gen-${t.position}`} className="rounded bg-green-600/30 px-2 py-0.5">
                      {t.text}
                    </span>
                  ))}
                </div>
              </>
            )}

            {generatedText && (
              <div className="mt-3 p-2 rounded bg-surface-secondary border border-border-subtle">
                <div className="text-xs text-text-secondary mb-1">Output:</div>
                <div className="text-text-primary">{generatedText}</div>
              </div>
            )}

            {candidates.length > 0 && (
              <div className="mt-3 p-2 rounded bg-surface-secondary border border-border-subtle">
                <div className="text-xs text-text-secondary mb-1">Last Token Candidates (Real Logprobs):</div>
                {candidates.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between text-xs mt-1">
                    <span className="text-text-primary font-mono">{JSON.stringify(c.token)}</span>
                    <span className="text-green-400">{(c.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {metrics && (
              <div className="mt-3 p-2 rounded bg-surface-secondary border border-border-subtle">
                <div className="text-xs text-text-secondary mb-2">Inference Metrics:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-secondary">Prompt:</span>
                    <span className="text-text-primary ml-1">{metrics.promptTokens} tokens</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Output:</span>
                    <span className="text-text-primary ml-1">{metrics.completionTokens} tokens</span>
                  </div>
                  {metrics.decodeTime && (
                    <div>
                      <span className="text-text-secondary">Time:</span>
                      <span className="text-text-primary ml-1">{(metrics.decodeTime / 1000).toFixed(2)}s</span>
                    </div>
                  )}
                  {metrics.tokensPerSecond && (
                    <div>
                      <span className="text-text-secondary">Speed:</span>
                      <span className="text-cyan-400 ml-1">{metrics.tokensPerSecond.toFixed(1)} tok/s</span>
                    </div>
                  )}
                  {metrics.gpuVendor && (
                    <div className="col-span-2">
                      <span className="text-text-secondary">GPU:</span>
                      <span className="text-amber-400 ml-1">{metrics.gpuVendor}</span>
                    </div>
                  )}
                  {metrics.maxBufferSize && (
                    <div className="col-span-2">
                      <span className="text-text-secondary">Buffer:</span>
                      <span className="text-text-primary ml-1">{(metrics.maxBufferSize / 1024 / 1024).toFixed(0)} MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <LayerTabs />
          <SamplingSlider />
          <ProbabilityProgress />
        </div>
      </div>
    </WebGPUGuard>
  );
}
