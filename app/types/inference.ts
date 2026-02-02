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

export interface InferenceMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  prefillTime?: number;      // ms for prompt processing
  decodeTime?: number;       // ms for generation
  tokensPerSecond?: number;  // decode speed
  gpuVendor?: string;
  maxBufferSize?: number;
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
  generatedText: string;
  generatedTokens: Token[];
  metrics: InferenceMetrics | null;

  setStatus: (status: InferenceState['status']) => void;
  setTokens: (tokens: Token[]) => void;
  addAttentionWeights: (weights: AttentionWeight[]) => void;
  setCandidates: (candidates: TokenCandidate[]) => void;
  setTemperature: (temp: number) => void;
  setTopP: (p: number) => void;
  setCurrentLayer: (layer: number) => void;
  setGeneratedText: (text: string) => void;
  addGeneratedToken: (token: Token) => void;
  setMetrics: (metrics: InferenceMetrics) => void;
  reset: () => void;
}

export interface InputFormData {
  prompt: string;
  modelId: string;
}
