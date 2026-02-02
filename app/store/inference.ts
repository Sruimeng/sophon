import { create } from 'zustand';
import type { AppStore, AttentionWeight, Token, TokenCandidate } from '~/types/inference';

export const useInferenceStore = create<AppStore>((set) => ({
  status: 'idle',
  tokens: [],
  attentionWeights: [],
  candidates: [],
  temperature: 0.7,
  topP: 0.9,
  currentLayer: 0,

  setStatus: (status: AppStore['status']) => set({ status }),
  setTokens: (tokens: Token[]) => set({ tokens }),
  addAttentionWeights: (weights: AttentionWeight[]) =>
    set((state) => ({
      attentionWeights: [...state.attentionWeights, ...weights],
    })),
  setCandidates: (candidates: TokenCandidate[]) => set({ candidates }),
  setTemperature: (temperature: number) => set({ temperature }),
  setTopP: (topP: number) => set({ topP }),
  setCurrentLayer: (currentLayer: number) => set({ currentLayer }),
  reset: () =>
    set({
      status: 'idle',
      tokens: [],
      attentionWeights: [],
      candidates: [],
      currentLayer: 0,
    }),
}));
