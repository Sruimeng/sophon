import type * as THREE from 'three';

export interface Token {
  id: number;
  text: string;
  position: number;
}

export interface AttentionWeight {
  query: number;
  key: number;
  weight: number;
  layer: number;
}

export interface TokenCandidate {
  token: string;
  probability: number;
  tokenId: number;
}

export interface TokenMesh {
  token: Token;
  mesh: THREE.InstancedMesh;
  position: THREE.Vector3;
}

export interface AttentionLine {
  line: THREE.Line;
  weight: AttentionWeight;
}

export interface InferenceState {
  status: 'idle' | 'tokenizing' | 'embedding' | 'inferring' | 'sampling' | 'complete';
  tokens: Token[];
  currentLayer: number;
  attentionWeights: AttentionWeight[];
  candidates: TokenCandidate[];
  selectedToken: Token | null;
  temperature: number;
  topP: number;
}

export interface ModelConfig {
  modelId: string;
  device: 'webgpu';
  progressCallback: (progress: number) => void;
}

export interface AppStore {
  status: InferenceState['status'];
  tokens: Token[];
  attentionWeights: AttentionWeight[];
  candidates: TokenCandidate[];
  temperature: number;
  topP: number;
  currentLayer: number;

  setStatus: (status: InferenceState['status']) => void;
  setTokens: (tokens: Token[]) => void;
  addAttentionWeights: (weights: AttentionWeight[]) => void;
  setCandidates: (candidates: TokenCandidate[]) => void;
  setTemperature: (temp: number) => void;
  setTopP: (p: number) => void;
  setCurrentLayer: (layer: number) => void;
  reset: () => void;
}

export interface InputFormData {
  prompt: string;
  modelId: string;
}
