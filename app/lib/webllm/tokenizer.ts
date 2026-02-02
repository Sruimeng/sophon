import type { Token } from '~/types/inference';

/**
 * Tokenize text for visualization.
 * WebLLM doesn't expose tokenizer API directly, so we use character-based segmentation
 * for Chinese and word-based for English to provide a reasonable approximation.
 */
export async function tokenize(text: string): Promise<Token[]> {
  const tokens: Token[] = [];
  let position = 0;

  // Split by whitespace first, then segment Chinese characters
  const segments = text.split(/(\s+)/);

  for (const segment of segments) {
    if (!segment) continue;

    // Whitespace
    if (/^\s+$/.test(segment)) {
      tokens.push({ id: hashString(segment), text: segment, position: position++ });
      continue;
    }

    // Check if contains CJK characters
    const hasCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(segment);

    if (hasCJK) {
      // Segment CJK characters individually (closer to BPE behavior)
      for (const char of segment) {
        tokens.push({ id: hashString(char), text: char, position: position++ });
      }
    } else {
      // Non-CJK: treat as single token
      tokens.push({ id: hashString(segment), text: segment, position: position++ });
    }
  }

  console.log('[tokenizer] Tokenized', text, 'to', tokens.length, 'tokens');
  return tokens;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
