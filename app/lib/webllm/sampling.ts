import type { TokenCandidate } from '~/types/inference';

export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];

  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);

  if (sum === 0) return logits.map(() => 0);

  return exps.map((e) => e / sum);
}

export function sampleTopP(probs: number[], topP: number): number {
  const sorted = probs
    .map((p, i) => ({ prob: p, idx: i }))
    .sort((a, b) => b.prob - a.prob);

  let cumulative = 0;
  const nucleus: typeof sorted = [];

  for (const item of sorted) {
    cumulative += item.prob;
    nucleus.push(item);
    if (cumulative >= topP) break;
  }

  if (nucleus.length === 0) return 0;

  const rand = Math.random() * cumulative;
  let acc = 0;

  for (const item of nucleus) {
    acc += item.prob;
    if (rand <= acc) return item.idx;
  }

  return nucleus[0].idx;
}

export function generateMockCandidates(temperature: number): TokenCandidate[] {
  const vocab = ['the', 'a', 'is', 'are', 'in', 'to', 'of', 'and', 'for', 'with'];

  const rawLogits = vocab.map(() => Math.random() * 10 - 5);
  const scaled = rawLogits.map((l) => l / temperature);
  const probs = softmax(scaled);

  const sorted = probs
    .map((p, i) => ({ prob: p, idx: i }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5);

  return sorted.map(({ prob, idx }) => ({
    token: vocab[idx],
    probability: prob,
    tokenId: idx,
  }));
}
