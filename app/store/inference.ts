import { create } from 'zustand';
import type { AppStore, AttentionWeight, Token, TokenCandidate, InferenceMetrics } from '~/types/inference';

console.log('[inference store] Creating store...');

export const useInferenceStore = create<AppStore>((set, get) => ({
  status: 'idle',
  tokens: [],
  attentionWeights: [],
  candidates: [],
  temperature: 0.7,
  topP: 0.9,
  currentLayer: 0,
  generatedText: '',
  generatedTokens: [],
  metrics: null,
  tokenDelay: 500,

  setStatus: (status: AppStore['status']) => set({ status }),
  setTokens: (tokens: Token[]) => {
    console.log('[inference store] setTokens called with', tokens.length, 'tokens');
    set({ tokens });
    console.log('[inference store] after setTokens, store tokens:', get().tokens.length);
  },
  addAttentionWeights: (weights: AttentionWeight[]) =>
    set((state) => ({
      attentionWeights: [...state.attentionWeights, ...weights],
    })),
  setCandidates: (candidates: TokenCandidate[]) => set({ candidates }),
  setTemperature: (temperature: number) => set({ temperature }),
  setTopP: (topP: number) => set({ topP }),
  setCurrentLayer: (currentLayer: number) => set({ currentLayer }),
  setGeneratedText: (generatedText: string) => set({ generatedText }),
  addGeneratedToken: (token: Token) =>
    set((state) => ({
      generatedTokens: [...state.generatedTokens, token],
    })),
  setMetrics: (metrics: InferenceMetrics) => set({ metrics }),
  setTokenDelay: (tokenDelay: number) => set({ tokenDelay }),
  reset: () =>
    set({
      status: 'idle',
      tokens: [],
      attentionWeights: [],
      candidates: [],
      currentLayer: 0,
      generatedText: '',
      generatedTokens: [],
      metrics: null,
    }),
}));
