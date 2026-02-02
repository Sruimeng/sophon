---
id: strategy-performance-optimization
type: strategy
related_ids: [strategy-3d-visualization]
---

# Performance Optimization Strategy

**Target:** Reduce draw calls <200, maintain 60 FPS, memory <50MB
**Authority:** `style-hemingway.md` (Iceberg Principle, Type-First, Composition)
**Severity:** Critical - Current O(n²) complexity with geometry recreation per frame

---

## 1. Data Models (Type-First Design)

### 1.1 Geometry Pool

```typescript
interface GeometryPool<T extends THREE.BufferGeometry> {
  geometry: T;
  instances: THREE.InstancedMesh;
  capacity: number;
  activeCount: number;
  matricesBuffer: THREE.Matrix4[];
}

interface TorusPool extends GeometryPool<THREE.TorusGeometry> {
  segmentConfigs: Map<string, number>; // "angle_radius" -> index
}

interface SpherePool extends GeometryPool<THREE.SphereGeometry> {
  layerIndices: Map<number, THREE.InstancedMesh>; // layer -> mesh
}
```

### 1.2 Animation State (RAF Migration)

```typescript
interface AnimationController {
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  update: (elapsed: number, target: THREE.Object3D) => boolean; // returns isDone
}

interface TokenAnimationState {
  tokenId: number;
  controller: AnimationController;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  matrixIndex: number; // Index in InstancedMesh
}
```

### 1.3 Matrix Update Batch

```typescript
interface BatchUpdate {
  mesh: THREE.InstancedMesh;
  updates: Map<number, THREE.Matrix4>; // instanceIndex -> matrix
  needsUpdate: boolean;
}

type BatchRegistry = Map<THREE.InstancedMesh, BatchUpdate>;
```

---

## 2. Performance Bottlenecks (Gap Analysis)

| File | Violation | Impact | Fix |
|------|-----------|--------|-----|
| `ProbabilityRing.tsx:41-50` | `new TorusGeometry()` per segment | 8K verts × 8 segs = 64K | **Torus instancing** |
| `TokenLayer.tsx:17-44` | `new InstancedMesh()` on token add | Dual mesh disposal | **Single persistent mesh** |
| `EmbeddingAnimation.tsx:29-53` | `requestAnimationFrame` + `setState` | 60Hz React re-render | **useFrame + refs** |
| `TokenJourney.tsx:166-194` | Nested loop: `O(layers × tokens)` | 5 layers × 30 tokens × 60fps | **Batch matrix updates** |
| `AttentionLines.tsx:85` | `new THREE.Color()` per render | 100 × 60fps allocations | **Color pool** |
| `generate.ts:106-116` | `O(tokens × candidates)` | 2,700 objects for 30 tokens | **Flatten to typed array** |

---

## 3. Optimization Strategies (Pseudocode)

### 3.1 ProbabilityRing: Torus Instancing

**Current:** Create N TorusGeometry instances
**Target:** Single TorusGeometry + InstancedMesh + Matrix transforms

```
ALGORITHM: TorusInstancing

INIT:
  baseGeometry ← TorusGeometry(radius=2, tube=0.1, radialSeg=16, tubularSeg=64, arc=2π)
  instancedMesh ← InstancedMesh(baseGeometry, material, capacity=8)

ON candidates change:
  segments ← computeRingSegments(candidates)

  FOR i, seg IN segments:
    matrix ← Matrix4()

    // Rotation: compensate for full-circle geometry
    angle ← seg.centerAngle - π
    matrix.makeRotationY(angle)

    // Position
    matrix.setPosition(position.x, position.y, position.z)

    // Scale arc angle (NOT POSSIBLE - geometry is full circle)
    // FALLBACK: Use opacity masking or custom shader

    instancedMesh.setMatrixAt(i, matrix)

  instancedMesh.instanceMatrix.needsUpdate = true

  // Hide unused instances
  FOR j = segments.length TO capacity:
    matrix.setPosition(0, -1000, 0) // Hide offscreen
    instancedMesh.setMatrixAt(j, matrix)
```

**CRITICAL ISSUE:** TorusGeometry arc angle is geometry-level (cannot be instanced)
**REVISED APPROACH:** Use custom shader with vertex masking

```glsl
// Vertex Shader Pseudocode
uniform float arcAngles[8];
uniform float centerAngles[8];

void main() {
  int instanceId = gl_InstanceID;
  float vertexAngle = atan(position.z, position.x); // Torus angle
  float arc = arcAngles[instanceId];
  float center = centerAngles[instanceId];

  // Mask vertices outside arc range
  float offset = mod(vertexAngle - center + π, 2π) - π;
  if (abs(offset) > arc / 2.0) {
    gl_Position = vec4(0); // Discard vertex
    return;
  }

  // Standard transform
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
```

**Fallback (Simpler):** Accept full torus + opacity fade at edges

---

### 3.2 TokenLayer: Persistent Mesh Architecture

**Current:** Recreate mesh on every token add (dual useEffect)
**Target:** Single mesh, update matrices only

```
ALGORITHM: PersistentTokenMesh

INIT (once):
  inputMesh ← InstancedMesh(boxGeo, blueMat, capacity=MAX_TOKENS)
  genMesh ← InstancedMesh(boxGeo, greenMat, capacity=MAX_TOKENS)
  scene.add(inputMesh, genMesh)

ON tokens change:
  totalWidth ← allTokens.length × TOKEN_SPACING
  offset ← totalWidth / 2

  FOR i, token IN inputTokens:
    matrix ← Matrix4()
    matrix.setPosition(i × TOKEN_SPACING - offset, EMBEDDING_Y, 0)
    inputMesh.setMatrixAt(i, matrix)

  // Hide unused
  hiddenMatrix ← Matrix4.setPosition(0, -1000, 0)
  FOR j = inputTokens.length TO capacity:
    inputMesh.setMatrixAt(j, hiddenMatrix)

  inputMesh.instanceMatrix.needsUpdate = true

  // Repeat for genMesh...
```

**Key Change:** Mesh lives in module scope (useRef), not useEffect cleanup

---

### 3.3 EmbeddingAnimation: RAF → useFrame Migration

**Current:** `requestAnimationFrame` triggers `setState` → React re-render
**Target:** `useFrame` updates refs directly

```
ALGORITHM: FrameLoopAnimation

SETUP:
  animationStates ← useRef<Map<number, TokenAnimationState>>(new Map())
  meshRef ← useRef<InstancedMesh>()

ON allTokens change:
  FOR i, token IN allTokens:
    state ← {
      tokenId: token.position,
      controller: { startTime: now, duration: 800, easing: easeInOut },
      startPos: Vector3(x, 8, -5),
      targetPos: Vector3(x, 0, 0),
      matrixIndex: i
    }
    animationStates.current.set(token.position, state)

useFrame (clock, delta):
  elapsed ← clock.elapsedTime × 1000
  allComplete ← true

  FOR state IN animationStates.current.values():
    t ← (elapsed - state.controller.startTime) / state.controller.duration

    IF t >= 1:
      CONTINUE

    allComplete ← false
    progress ← state.controller.easing(clamp(t, 0, 1))

    // Interpolate position
    pos ← Vector3.lerpVectors(state.startPos, state.targetPos, progress)

    // Update matrix (NO REACT STATE)
    matrix ← Matrix4()
    matrix.setPosition(pos)
    meshRef.current.setMatrixAt(state.matrixIndex, matrix)

  IF NOT allComplete:
    meshRef.current.instanceMatrix.needsUpdate = true
    invalidate() // Re-render on next frame
```

**Critical:** Remove `setAnimationProgress(newMap)` → No React overhead

---

### 3.4 TokenJourney: Batch Matrix Updates

**Current:** Nested loop updates all instances every frame
**Target:** Track dirty indices, batch updates

```
ALGORITHM: BatchMatrixUpdate

INIT:
  dirtyIndices ← useRef<Set<number>>(new Set())
  lastUpdateFrame ← useRef<number>(0)

useFrame (clock):
  currentFrame ← clock.elapsedTime

  // Skip if no changes
  IF dirtyIndices.current.size === 0:
    RETURN

  // Batch update
  FOR layerIdx IN 0..LAYER_COUNT:
    mesh ← layerMeshRefs[layerIdx]

    FOR tokenIdx IN dirtyIndices.current:
      state ← tokenStates[tokenIdx]

      IF state.currentLayer === layerIdx:
        matrix ← computeMatrix(state) // FFN pulse, position
        mesh.setMatrixAt(tokenIdx, matrix)

    mesh.instanceMatrix.needsUpdate = true

  dirtyIndices.current.clear()

ON state.phase change:
  dirtyIndices.current.add(tokenIdx)
```

**Key:** Only update matrices when phase changes (not every frame)

---

### 3.5 AttentionLines: Color Pool

**Current:** `new THREE.Color()` for every line render
**Target:** Pre-allocate color palette

```
ALGORITHM: ColorPool

INIT (module scope):
  COLOR_PALETTE ← Array.from({ length: 20 }, (_, i) => {
    hue ← 0.55
    lightness ← 0.4 + (i / 20) × 0.3
    return new THREE.Color().setHSL(hue, 0.8, lightness)
  })

ON render line:
  weightIndex ← floor(arc.weight × 20)
  color ← COLOR_PALETTE[clamp(weightIndex, 0, 19)]

  // Use color reference (no allocation)
```

---

### 3.6 Inference Data: Flatten Attention Weights

**Current:** Array of objects with nested properties
**Target:** TypedArray + index-based lookup

```
ALGORITHM: FlattenAttentionWeights

STRUCTURE:
  attentionBuffer ← Float32Array(maxTokens × maxTokens × 4)
  // [query, key, weight, layer] × (tokens²)

WRITE (during generation):
  FOR layer, query, key, weight IN attentionData:
    index ← (layer × tokens² + query × tokens + key) × 4
    attentionBuffer[index] = query
    attentionBuffer[index + 1] = key
    attentionBuffer[index + 2] = weight
    attentionBuffer[index + 3] = layer

READ (during render):
  FOR i = 0 TO attentionBuffer.length BY 4:
    query ← attentionBuffer[i]
    key ← attentionBuffer[i + 1]
    weight ← attentionBuffer[i + 2]
    layer ← attentionBuffer[i + 3]

    IF weight < MIN_THRESHOLD:
      CONTINUE

    renderLine(query, key, weight, layer)
```

**Memory Savings:** 2,700 objects → 10,800 floats (43KB vs ~200KB)

---

## 4. Implementation Plan (Priority Order)

### Phase 1: Critical Path (Week 1)
1. **TokenLayer.tsx** - Persistent mesh (Blocks: Layout recalc)
2. **EmbeddingAnimation.tsx** - RAF migration (Blocks: 60Hz React)
3. **AttentionLines.tsx** - Color pool (Low-hanging fruit)

### Phase 2: Complexity (Week 2)
4. **TokenJourney.tsx** - Batch updates (Complex state management)
5. **generate.ts** - Flatten data (Requires store refactor)

### Phase 3: Advanced (Week 3)
6. **ProbabilityRing.tsx** - Shader-based instancing (Requires WebGL knowledge)

---

## 5. Performance Metrics (Success Criteria)

| Metric | Current | Target | Measure |
|--------|---------|--------|---------|
| Draw Calls | ~350 | <200 | Chrome DevTools Performance |
| Frame Time | 25-40ms | <16ms (60 FPS) | `stats.js` overlay |
| Heap Memory | ~80MB | <50MB | Chrome Task Manager |
| Token Add Latency | ~120ms | <50ms | `performance.mark()` |
| Attention Render | O(n²) | O(n log n) | Profiler flame graph |

**Test Case:** 30 tokens, 5 layers, 100 attention lines

---

## 6. File Change Matrix

| File | Change Type | Lines Affected | Risk |
|------|-------------|----------------|------|
| `ProbabilityRing.tsx` | Refactor + Shader | 40-84 | HIGH |
| `TokenLayer.tsx` | Refactor | 1-80 | MEDIUM |
| `EmbeddingAnimation.tsx` | Rewrite | 10-54 | MEDIUM |
| `TokenJourney.tsx` | Optimization | 108-198 | HIGH |
| `AttentionLines.tsx` | Patch | 85 | LOW |
| `generate.ts` | Data Layer | 106-116 | LOW |
| `inference.ts` (store) | Schema Change | TBD | MEDIUM |

---

## 7. Technical Constraints (Boundary Rules)

### 7.1 drei Components (Approved)
- `QuadraticBezierLine` - Keep (no instancing alternative)
- `Billboard` - Keep (text always faces camera)
- `Text` - Keep (SDF rendering)

### 7.2 Canvas Settings (Enforce)
```typescript
<Canvas frameloop="demand"> // Only render when invalidate() called
  <Scene />
</Canvas>
```

### 7.3 Object Creation Ban
```typescript
// ❌ BANNED in render/useFrame
new THREE.Vector3()
new THREE.Color()
new THREE.Matrix4()

// ✅ ALLOWED
const tempVec = new THREE.Vector3() // Module scope
tempVec.set(x, y, z) // Reuse in loop
```

---

## 8. Code Review Checklist

- [ ] No geometry creation in useEffect (except initial)
- [ ] No `new` keyword in useFrame
- [ ] Matrix updates batched per frame
- [ ] InstancedMesh capacity set to MAX (not dynamic)
- [ ] Unused instances hidden via matrix (not removed)
- [ ] Color/Vector pools used for high-frequency ops
- [ ] `invalidate()` called only when visual change needed
- [ ] TypedArrays used for >1000 data points

---

## 9. Rollback Strategy

IF performance degrades:
1. Revert `TokenLayer.tsx` (simplest rollback)
2. Feature flag shader-based torus (`USE_INSTANCED_TORUS=false`)
3. Throttle attention lines (`MAX_LINES = 30` → emergency cap)

---

## 10. References

- **Style Authority:** `/Users/mac/.claude/plugins/marketplaces/sr-plugin/skills/style-hemingway.md`
- **Doc Standard:** `/Users/mac/Desktop/project/Sruimeng/sophon/llmdoc/guides/doc-standard.md`
- **THREE.js Instancing:** https://threejs.org/docs/#api/en/objects/InstancedMesh
- **React Three Fiber Performance:** https://docs.pmnd.rs/react-three-fiber/advanced/performance

---

**End Strategy** - Ready for `/sr:do` execution
