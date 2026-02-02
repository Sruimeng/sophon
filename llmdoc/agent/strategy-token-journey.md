---
id: strategy-token-journey
type: strategy
related_ids: [prd, nexus-api-reference, style-hemingway]
---

# Strategy: Token Journey Visualization Engine

## 1. Analysis

### Context
Build a real-time WebGPU-powered LLM inference visualizer. Transform text → tokens → embeddings → 3D attention flow → probability distribution. Educational tool for AI model transparency.

### Constitution
**Ref:** `style-hemingway` (Full Adherence)

**Key Rules:**
1. **Type-First:** Interface definitions precede implementation.
2. **No "What" Comments:** Code explains WHAT, comments explain WHY.
3. **Early Returns:** Guard clauses, max nesting depth = 3.
4. **Newspaper Structure:** Critical paths at top, helpers at bottom.
5. **WebGPU Mandate:** Three.js r171+ `await renderer.init()` for WebGPU backend.
6. **Zustand Flat Stores:** No derived state, no nested slices.
7. **Performance Budget:** <100 draw calls, use `InstancedMesh` for tokens.

**Ref:** `nexus-api-reference`
- **Form:** Zod validation via `useForm((z) => schema)`.
- **Dialog:** Imperative API for loading states: `Dialog.show(<Loading />)`.
- **Progress/Slider:** Real-time parameter control (Temperature, Top-P).
- **Tabs:** Layer navigation (Embedding, Transformer Blocks, Sampling).

### Style Protocol
"Strict Adherence to Hemingway Iceberg Principle. Type signatures ARE the documentation. Reject verbose comments, redundant wrappers, meta-talk."

### Negative Constraints
🚫 NO `new THREE.Geometry()` in loops (pre-allocate, use `InstancedMesh`).
🚫 NO derived Zustand state (compute in components via `useMemo`).
🚫 NO "what" comments (`// loop tokens` ❌).
🚫 NO Hungarian notation (`strTokenText` ❌).
🚫 NO bloated interfaces (`ITokenData` ❌, use `Token` ✅).
🚫 NO inline WebGPU checks (centralize in `checkWebGPU()` guard).

---

## 2. Assessment

<Assessment>
**Complexity:** Level 3 (Deep)
**Rationale:** Requires WebGPU renderer orchestration, attention matrix math, async model loading state machines, real-time 3D scene updates.
</Assessment>

---

## 3. Math/Algo Specification

<MathSpec>

### 3.1 Tokenization Flow
```
Input: string → WebLLM Tokenizer
Output: Token[] = { id: number, text: string, position: number }
```

### 3.2 Camera Setup (LookAt Math)
```
Eye = [0, 5, 10]
Target = [0, 0, 0]
Forward = Normalize(Target - Eye)
Right = Normalize(Cross(Forward, WorldUp))
Up = Cross(Right, Forward)
```

### 3.3 Token Embedding Positioning
```
For token[i] in tokens:
  position.x = i * TOKEN_SPACING
  position.y = EMBEDDING_LAYER_Y
  position.z = 0
```

### 3.4 Attention Weight Rendering
```
For each (queryToken, keyToken) pair:
  weight = attentionMatrix[q][k]  // [0, 1]
  if weight < THRESHOLD: skip

  line = new THREE.Line(
    from: token[q].mesh.position,
    to: token[k].mesh.position,
    opacity: weight,
    lineWidth: weight * MAX_LINE_WIDTH
  )
```

### 3.5 Probability Distribution (Softmax)
```
logits = model.forward(tokens)  // [vocab_size]
scaled = logits / temperature
probs = softmax(scaled)

top5 = argsort(probs)[-5:]  // Last 5 indices
candidates = top5.map(i => ({
  token: vocab[i],
  prob: probs[i]
}))
```

### 3.6 Sampling (Top-P Nucleus)
```
sorted = sortDescending(probs)
cumulative = 0
nucleus = []

for prob in sorted:
  cumulative += prob
  nucleus.push(prob)
  if cumulative >= topP: break

selected = sample(nucleus)
```

</MathSpec>

---

## 4. Type Definitions

```typescript
// Core Domain Models
interface Token {
  id: number;          // Vocabulary index
  text: string;        // Original text
  position: number;    // Sequence index
}

interface AttentionWeight {
  query: number;       // Query token index
  key: number;         // Key token index
  weight: number;      // [0, 1]
  layer: number;       // Transformer layer
}

interface TokenCandidate {
  token: string;
  probability: number;
  tokenId: number;
}

// 3D Scene Objects
interface TokenMesh {
  token: Token;
  mesh: THREE.InstancedMesh;
  position: THREE.Vector3;
}

interface AttentionLine {
  line: THREE.Line;
  weight: AttentionWeight;
}

// Inference State
interface InferenceState {
  status: 'idle' | 'tokenizing' | 'embedding' | 'inferring' | 'sampling' | 'complete';
  tokens: Token[];
  currentLayer: number;
  attentionWeights: AttentionWeight[];
  candidates: TokenCandidate[];
  selectedToken: Token | null;
  temperature: number;
  topP: number;
}

// WebLLM Integration
interface ModelConfig {
  modelId: string;      // 'Llama-3-8B-Instruct-q4f16_1-MLC'
  device: 'webgpu';
  progressCallback: (progress: number) => void;
}

// Store Schema (FLAT - NO NESTING)
interface AppStore {
  // Inference
  status: InferenceState['status'];
  tokens: Token[];
  attentionWeights: AttentionWeight[];
  candidates: TokenCandidate[];
  temperature: number;
  topP: number;
  currentLayer: number;

  // Actions
  setStatus: (status: InferenceState['status']) => void;
  setTokens: (tokens: Token[]) => void;
  addAttentionWeights: (weights: AttentionWeight[]) => void;
  setCandidates: (candidates: TokenCandidate[]) => void;
  setTemperature: (temp: number) => void;
  setTopP: (p: number) => void;
  setCurrentLayer: (layer: number) => void;
  reset: () => void;
}

// Form Schema
interface InputFormData {
  prompt: string;
  modelId: string;
}
```

---

## 5. Store Design

```typescript
// stores/inference.ts
import { create } from 'zustand';

const useInferenceStore = create<AppStore>((set) => ({
  // State (Flat)
  status: 'idle',
  tokens: [],
  attentionWeights: [],
  candidates: [],
  temperature: 0.7,
  topP: 0.9,
  currentLayer: 0,

  // Actions (Pure Setters)
  setStatus: (status) => set({ status }),
  setTokens: (tokens) => set({ tokens }),
  addAttentionWeights: (weights) =>
    set((state) => ({
      attentionWeights: [...state.attentionWeights, ...weights]
    })),
  setCandidates: (candidates) => set({ candidates }),
  setTemperature: (temperature) => set({ temperature }),
  setTopP: (topP) => set({ topP }),
  setCurrentLayer: (currentLayer) => set({ currentLayer }),
  reset: () => set({
    status: 'idle',
    tokens: [],
    attentionWeights: [],
    candidates: [],
    currentLayer: 0,
  }),
}));
```

**Rationale:** No derived state (e.g., `filteredWeights`). Components compute via `useMemo` or direct array methods.

---

## 6. Component Architecture

```
app/
├── routes/
│   ├── _index.tsx                    # Landing (Form + Instructions)
│   └── visualize.tsx                 # Main 3D View
│
├── components/
│   ├── input/
│   │   ├── PromptForm.tsx           # Form + Model Select
│   │   └── TokenBadges.tsx          # Display tokenized output
│   │
│   ├── visualization/
│   │   ├── Scene.tsx                # Three.js Canvas wrapper
│   │   ├── TokenLayer.tsx           # InstancedMesh for tokens
│   │   ├── AttentionLines.tsx       # Dynamic line rendering
│   │   ├── Camera.tsx               # OrbitControls + initial LookAt
│   │   └── LayerContainer.tsx       # DeepGlass visual separators
│   │
│   ├── controls/
│   │   ├── LayerTabs.tsx            # Navigate transformer layers
│   │   ├── SamplingSlider.tsx       # Temperature/Top-P controls
│   │   └── ProbabilityProgress.tsx  # Top-5 candidate display
│   │
│   └── shared/
│       ├── LoadingDialog.tsx        # Dialog.show wrapper
│       └── WebGPUGuard.tsx          # Confirm.show on unsupported browser
│
└── lib/
    ├── webllm/
    │   ├── engine.ts                # MLCEngine wrapper
    │   ├── tokenizer.ts             # Tokenization helpers
    │   └── inference.ts             # Forward pass + attention extraction
    │
    └── three/
        ├── renderer.ts              # WebGPURenderer init
        ├── materials.ts             # Token material (MeshStandardMaterial)
        ├── geometry.ts              # Reusable BoxGeometry pool
        └── attention.ts             # Line geometry generator
```

---

## 7. Implementation Pseudocode

### 7.1 Stage 1: Tokenization

#### Component: `PromptForm.tsx`
```tsx
const form = useForm((z) => ({
  resolver: z.object({
    prompt: z.string().min(1),
    modelId: z.string(),
  }),
  defaultValues: { prompt: '', modelId: 'Llama-3-8B' },
}));

async function onSubmit(data: InputFormData) {
  if (!checkWebGPU()) {
    Confirm.show({ title: 'WebGPU Required', ... });
    return;
  }

  const close = Dialog.show(<LoadingDialog />);

  try {
    const engine = await initEngine(data.modelId);
    const tokens = await engine.tokenize(data.prompt);

    useInferenceStore.getState().setTokens(tokens);
    navigate('/visualize');
  } finally {
    close();
  }
}
```

#### Utility: `checkWebGPU()`
```ts
function checkWebGPU(): boolean {
  return 'gpu' in navigator;
}
```

---

### 7.2 Stage 2: 3D Visualization

#### Component: `Scene.tsx`
```tsx
export function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGPURenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGPURenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    // CRITICAL: WebGPU init
    await renderer.init();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = createCamera();

    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    return () => renderer.dispose();
  }, []);

  return <canvas ref={canvasRef} />;
}
```

#### Helper: `createCamera()`
```ts
function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  return camera;
}
```

---

#### Component: `TokenLayer.tsx`
```tsx
const TOKEN_SPACING = 1.5;
const EMBEDDING_Y = 0;

export function TokenLayer() {
  const tokens = useInferenceStore((s) => s.tokens);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.3,
      roughness: 0.4,
    });

    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      tokens.length
    );

    const matrix = new THREE.Matrix4();

    tokens.forEach((token, i) => {
      matrix.setPosition(
        i * TOKEN_SPACING,
        EMBEDDING_Y,
        0
      );
      mesh.setMatrixAt(i, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    meshRef.current = mesh;
  }, [tokens]);

  return <instancedMesh ref={meshRef} />;
}
```

---

#### Component: `AttentionLines.tsx`
```tsx
const THRESHOLD = 0.1;
const MAX_LINE_WIDTH = 4;

export function AttentionLines() {
  const weights = useInferenceStore((s) => s.attentionWeights);
  const currentLayer = useInferenceStore((s) => s.currentLayer);
  const tokens = useInferenceStore((s) => s.tokens);

  const filteredWeights = useMemo(
    () => weights.filter(w => w.layer === currentLayer && w.weight > THRESHOLD),
    [weights, currentLayer]
  );

  return (
    <group>
      {filteredWeights.map((w, i) => {
        const from = tokens[w.query].position;
        const to = tokens[w.key].position;

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={0x60a5fa}
              opacity={w.weight}
              transparent
              linewidth={w.weight * MAX_LINE_WIDTH}
            />
          </line>
        );
      })}
    </group>
  );
}
```

---

### 7.3 Stage 3: Sampling Controls

#### Component: `SamplingSlider.tsx`
```tsx
export function SamplingSlider() {
  const temperature = useInferenceStore((s) => s.temperature);
  const topP = useInferenceStore((s) => s.topP);
  const setTemperature = useInferenceStore((s) => s.setTemperature);
  const setTopP = useInferenceStore((s) => s.setTopP);

  return (
    <div className="space-y-4">
      <div>
        <label>Temperature: {temperature.toFixed(2)}</label>
        <Slider
          value={[temperature]}
          onValueChange={([v]) => setTemperature(v)}
          min={0}
          max={2}
          step={0.1}
          showValue
        />
      </div>

      <div>
        <label>Top-P: {topP.toFixed(2)}</label>
        <Slider
          value={[topP]}
          onValueChange={([v]) => setTopP(v)}
          min={0}
          max={1}
          step={0.05}
          showValue
        />
      </div>
    </div>
  );
}
```

---

#### Component: `ProbabilityProgress.tsx`
```tsx
export function ProbabilityProgress() {
  const candidates = useInferenceStore((s) => s.candidates);

  if (candidates.length === 0) return null;

  return (
    <div className="space-y-2">
      {candidates.map((c) => (
        <div key={c.tokenId}>
          <div className="flex justify-between text-sm">
            <span>{c.token}</span>
            <span>{(c.probability * 100).toFixed(1)}%</span>
          </div>
          <Progress
            value={c.probability * 100}
            indicator="bg-core-blue"
          />
        </div>
      ))}
    </div>
  );
}
```

---

#### Inference Engine: `lib/webllm/inference.ts`
```ts
export async function runInference(
  engine: MLCEngine,
  tokens: Token[],
  temperature: number,
  topP: number
): Promise<TokenCandidate[]> {
  const logits = await engine.forward(tokens);

  const scaled = logits.map(l => l / temperature);
  const probs = softmax(scaled);

  const sorted = probs
    .map((p, i) => ({ prob: p, idx: i }))
    .sort((a, b) => b.prob - a.prob);

  const top5 = sorted.slice(0, 5);

  return top5.map(({ prob, idx }) => ({
    token: engine.vocab[idx],
    probability: prob,
    tokenId: idx,
  }));
}

function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}
```

---

## 8. Execution Plan

<ExecutionPlan>

### Block 1: Dependencies & Setup
1. Install: `pnpm add three @react-three/fiber @react-three/drei @mlc-ai/web-llm`
2. Configure Vite for WebGPU headers (COOP/COEP)
3. Create store: `stores/inference.ts`
4. Define types: `types/inference.ts`

### Block 2: WebGPU Foundation
1. Create `lib/three/renderer.ts` with `await renderer.init()`
2. Build `WebGPUGuard.tsx` with browser check
3. Implement `checkWebGPU()` utility
4. Test fallback flow with `Confirm.show`

### Block 3: Tokenization Pipeline
1. Build `PromptForm.tsx` with Zod schema
2. Create `lib/webllm/tokenizer.ts` wrapper
3. Implement `TokenBadges.tsx` display
4. Wire to store: `setTokens()`

### Block 4: 3D Scene Core
1. Initialize `Scene.tsx` with WebGPURenderer
2. Create `Camera.tsx` with LookAt math
3. Build `TokenLayer.tsx` with InstancedMesh
4. Add `OrbitControls` from drei

### Block 5: Attention Visualization
1. Create `lib/webllm/inference.ts` for attention extraction
2. Build `AttentionLines.tsx` with dynamic line rendering
3. Implement `LayerTabs.tsx` for layer navigation
4. Wire `currentLayer` filter to store

### Block 6: Sampling Controls
1. Build `SamplingSlider.tsx` (Temperature + Top-P)
2. Create `ProbabilityProgress.tsx` with candidate display
3. Implement `runInference()` with softmax
4. Wire slider changes → store → re-inference

### Block 7: UI Polish
1. Add `DeepGlass` materials to layer containers
2. Implement `LoadingDialog.tsx` for model loading
3. Add error boundaries
4. Performance audit: draw calls, InstancedMesh count

### Block 8: Integration Test
1. End-to-end flow: Input → Tokenize → 3D → Sampling
2. Verify WebGPU renderer initialization
3. Test attention weight thresholding
4. Validate Zustand store updates

</ExecutionPlan>

---

## 9. Negative Constraints (Enforcement)

### 🚫 Performance Violations
- ❌ Creating `new THREE.Mesh()` per token (use `InstancedMesh`)
- ❌ Re-creating geometries on re-render (memoize with `useMemo`)
- ❌ >100 draw calls (use instancing + batching)

### 🚫 Store Anti-Patterns
- ❌ Derived state in Zustand: `get filteredWeights() { ... }`
- ❌ Nested slices: `inference: { tokens: [], ... }`
- ❌ Actions with business logic (keep pure setters)

### 🚫 Code Style Violations
- ❌ "What" comments: `// Loop through tokens`
- ❌ Verbose names: `listOfActiveTokens`
- ❌ Nested depth > 3
- ❌ Meta-talk in docs: "In this section..."

### 🚫 WebGPU Violations
- ❌ Missing `await renderer.init()` (runtime error)
- ❌ No WebGPU browser check (silent failure)
- ❌ Forgetting `renderer.dispose()` (memory leak)

### 🚫 Type Violations
- ❌ Implicit `any` types
- ❌ Missing Zod schema for forms
- ❌ Untyped WebLLM responses

---

## 10. Success Criteria

1. ✅ Input "Hello World" → See 2-3 token blocks in 3D space
2. ✅ Attention lines visible with opacity = weight
3. ✅ Temperature slider → Real-time probability update
4. ✅ Layer tabs → Filter attention by transformer block
5. ✅ <100 draw calls (verify in Chrome DevTools)
6. ✅ WebGPU guard triggers on Safari 16 (no WebGPU)
7. ✅ No Hemingway style violations in codebase

---

## Related Documents

- **Ref:** `prd` (Product Requirements)
- **Ref:** `nexus-api-reference` (Component API)
- **Ref:** `style-hemingway` (Code Style Constitution)
