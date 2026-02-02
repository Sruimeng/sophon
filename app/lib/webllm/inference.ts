import type { AttentionWeight } from '~/types/inference';

const LAYER_COUNT = 3;
const MIN_WEIGHT = 0.05;
const MAX_WEIGHT = 0.95;

export function generateMockAttention(tokenCount: number, layer: number): AttentionWeight[] {
  if (tokenCount === 0) return [];

  const weights: AttentionWeight[] = [];

  for (let q = 0; q < tokenCount; q++) {
    for (let k = 0; k < tokenCount; k++) {
      const distance = Math.abs(q - k);

      const baseWeight = distance === 0
        ? MAX_WEIGHT
        : MAX_WEIGHT * Math.exp(-distance * 0.5);

      const noise = (Math.random() - 0.5) * 0.2;
      const weight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, baseWeight + noise));

      weights.push({ query: q, key: k, weight, layer });
    }
  }

  return weights;
}

export function generateAllLayersAttention(tokenCount: number): AttentionWeight[] {
  const allWeights: AttentionWeight[] = [];

  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    allWeights.push(...generateMockAttention(tokenCount, layer));
  }

  return allWeights;
}
