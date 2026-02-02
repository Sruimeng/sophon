---
id: strategy-tokensphere-instancing
type: strategy
related_ids: [strategy-performance-optimization, strategy-3d-visualization]
---

# TokenSphere Instancing Strategy

**Target:** 1,440 geoms/sec → 4 persistent meshes
**Authority:** `style-hemingway.md` (Iceberg Principle, Type-First, Persistent Objects)
**Severity:** Critical - Context Lost at 12+ tokens due to geometry leak

---

## 1. Root Cause

### 1.1 Geometry Leak

```typescript
// TokenSphere.tsx:50, 63
<sphereGeometry args={[0.4, 32, 32]} />  // New geometry EVERY render
```

**Impact:**
- 12 tokens × 2 spheres (main + glow) × 60fps = 1,440 geometries/sec
- No disposal mechanism
- GPU memory exhausted → WebGL Context Lost

### 1.2 Animation Trigger

```typescript
// EmbeddingAnimation.tsx:58-73
useFrame((state) => {
  progressRef.current.set(tokenId, progress);  // Update ref 60fps
});

// BUT TokenSphere receives progress as prop
<TokenSphere progress={progressRef.current.get(...)} />
// ↓ React re-render due to parent state change
```

**Chain Reaction:** Parent updates → Child re-renders → Geometry created

---

## 2. Data Models (Type-First Design)

### 2.1 Instance Pool

```typescript
interface SpherePool {
  mainMesh: THREE.InstancedMesh;
  glowMesh: THREE.InstancedMesh;
  capacity: number;
  type: 'input' | 'generated';
}

interface SpherePoolRegistry {
  input: SpherePool;
  generated: SpherePool;
}

interface PoolConfig {
  radius: number;
  segments: { main: number; glow: number };
  color: string;
  capacity: number;
}
```

### 2.2 Animation State

```typescript
interface TokenInstanceState {
  tokenId: number;
  instanceIndex: number;
  poolType: 'input' | 'generated';

  // Animation
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentProgress: number;  // 0-1

  // Pulse (for generating tokens)
  isGenerating: boolean;
  pulsePhase: number;
}

interface AnimationController {
  states: Map<number, TokenInstanceState>;
  hiddenMatrix: THREE.Matrix4;
  tempMatrix: THREE.Matrix4;
  tempScale: THREE.Vector3;
}
```

### 2.3 Label Management

```typescript
interface TokenLabel {
  tokenId: number;
  position: THREE.Vector3;
  text: string;
  idText: string;
  isVisible: boolean;
}

// Labels remain separate (drei <Text> not instanced)
type LabelRegistry = Map<number, TokenLabel>;
```

---

## 3. Migration Path (Old → New)

### 3.1 Architecture Shift

```
CURRENT:
  EmbeddingAnimation (parent)
    ↓ props: progress, position
  TokenSphere (12 components)
    ↓ creates
  <sphereGeometry> × 24 (main + glow)

TARGET:
  EmbeddingAnimation (parent)
    ↓ creates 4 meshes once
  InstancedMesh[input-main]     (capacity: MAX_TOKENS)
  InstancedMesh[input-glow]     (capacity: MAX_TOKENS)
  InstancedMesh[generated-main] (capacity: MAX_TOKENS)
  InstancedMesh[generated-glow] (capacity: MAX_TOKENS)
    ↓ updates via useFrame
  Matrix updates only (no React re-render)
    ↓ renders separately
  <Text> labels × N (unchanged)
```

### 3.2 Breaking Changes

| Item | Old | New |
|------|-----|-----|
| Component | `<TokenSphere>` per token | Single `<SphereInstancePool>` |
| Props | Individual `progress`, `position` | None (uses refs) |
| Animation | React re-render | Matrix updates |
| State Location | TokenSphere (local) | EmbeddingAnimation (parent) |
| Text Labels | Inside TokenSphere | Sibling to pool |

---

## 4. Implementation Pseudocode

### 4.1 Pool Initialization

```
ALGORITHM: InitSpherePool

INPUT: poolType ('input' | 'generated'), capacity

INIT (once per pool type):
  mainGeometry ← SphereGeometry(radius=0.4, widthSeg=32, heightSeg=32)
  glowGeometry ← SphereGeometry(radius=0.4, widthSeg=16, heightSeg=16)

  color ← poolType === 'input' ? '#3b82f6' : '#22c55e'

  mainMaterial ← MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.4,
    emissive: color,
    emissiveIntensity: 0.1
  })

  glowMaterial ← MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3
  })

  mainMesh ← InstancedMesh(mainGeometry, mainMaterial, capacity)
  glowMesh ← InstancedMesh(glowGeometry, glowMaterial, capacity)

  // Hide all instances initially
  hiddenMatrix ← Matrix4().setPosition(0, -1000, 0)
  FOR i = 0 TO capacity:
    mainMesh.setMatrixAt(i, hiddenMatrix)
    glowMesh.setMatrixAt(i, hiddenMatrix)

  mainMesh.instanceMatrix.needsUpdate = true
  glowMesh.instanceMatrix.needsUpdate = true

  RETURN {
    mainMesh,
    glowMesh,
    capacity,
    type: poolType
  }
```

### 4.2 Matrix Update Algorithm

```
ALGORITHM: UpdateTokenMatrices

INPUT: tokenStates (Map<tokenId, TokenInstanceState>), elapsed (ms)

INIT (module scope):
  tempMatrix ← Matrix4()
  tempScale ← Vector3()
  tempPos ← Vector3()

useFrame (clock):
  elapsed ← clock.elapsedTime × 1000

  FOR state IN tokenStates.values():
    pool ← pools[state.poolType]

    // Calculate interpolated position
    t ← easeOutCubic(state.currentProgress)
    tempPos.lerpVectors(state.startPos, state.targetPos, t)

    // Calculate scale (pulse for generating)
    baseScale ← 1.0
    glowOpacity ← 0.3

    IF state.isGenerating:
      phase ← elapsed × 0.004  // 4 rad/sec
      pulse ← sin(phase) × 0.1 + 1.0
      baseScale = pulse
      glowOpacity = sin(phase × 0.75) × 0.3 + 0.5

    // Update main sphere matrix
    tempMatrix.identity()
    tempMatrix.makeScale(baseScale, baseScale, baseScale)
    tempMatrix.setPosition(tempPos)
    pool.mainMesh.setMatrixAt(state.instanceIndex, tempMatrix)

    // Update glow sphere matrix (1.5x scale)
    IF state.isGenerating:
      tempMatrix.identity()
      tempMatrix.makeScale(baseScale × 1.5, baseScale × 1.5, baseScale × 1.5)
      tempMatrix.setPosition(tempPos)
      pool.glowMesh.setMatrixAt(state.instanceIndex, tempMatrix)

      // Update glow opacity (requires instance color attribute)
      pool.glowMesh.setColorAt(state.instanceIndex, new Color(1, 1, 1, glowOpacity))
    ELSE:
      // Hide glow when not generating
      pool.glowMesh.setMatrixAt(state.instanceIndex, hiddenMatrix)

  // Mark for GPU update
  FOR pool IN pools.values():
    pool.mainMesh.instanceMatrix.needsUpdate = true
    pool.glowMesh.instanceMatrix.needsUpdate = true
    IF pool.glowMesh.instanceColor:
      pool.glowMesh.instanceColor.needsUpdate = true
```

### 4.3 Token Add/Remove

```
ALGORITHM: OnTokenChange

INPUT: allTokens (Token[])

ON allTokens change:
  // Recalculate layout
  totalWidth ← allTokens.length × TOKEN_SPACING
  startX ← -totalWidth / 2

  // Update or create states
  FOR i, token IN allTokens:
    isGenerated ← i >= inputTokens.length
    poolType ← isGenerated ? 'generated' : 'input'

    IF NOT tokenStates.has(token.position):
      // New token - allocate instance
      state ← {
        tokenId: token.position,
        instanceIndex: findNextAvailableIndex(poolType),
        poolType,
        startPos: Vector3(startX + i × TOKEN_SPACING, 8, -5),
        targetPos: Vector3(startX + i × TOKEN_SPACING, 0, 0),
        currentProgress: 0,
        isGenerating: isGenerated AND status === 'inferring',
        pulsePhase: 0
      }
      tokenStates.set(token.position, state)
    ELSE:
      // Existing token - update target position
      state ← tokenStates.get(token.position)
      state.targetPos.set(startX + i × TOKEN_SPACING, 0, 0)

  // Remove deleted tokens
  FOR tokenId IN tokenStates.keys():
    IF NOT allTokens.find(t => t.position === tokenId):
      state ← tokenStates.get(tokenId)

      // Hide instance
      pool ← pools[state.poolType]
      pool.mainMesh.setMatrixAt(state.instanceIndex, hiddenMatrix)
      pool.glowMesh.setMatrixAt(state.instanceIndex, hiddenMatrix)

      // Recycle index
      recycledIndices[state.poolType].add(state.instanceIndex)

      tokenStates.delete(tokenId)
```

### 4.4 Progress Update (No React State)

```
ALGORITHM: ProgressUpdate

REPLACE:
  progressRef.current.set(tokenId, progress)
  // Re-render via props ❌

WITH:
  tokenStates.get(tokenId).currentProgress = progress
  // Matrix updates in useFrame ✅

useFrame (clock):
  elapsed ← clock.elapsedTime × 1000

  FOR state IN tokenStates.values():
    IF state.currentProgress < 1:
      tokenElapsed ← elapsed - state.startTime
      t ← tokenElapsed / ANIMATION_DURATION
      state.currentProgress = clamp(t, 0, 1)

  // Single update call
  UpdateTokenMatrices(tokenStates, elapsed)
```

---

## 5. Text Label Strategy

### 5.1 Remain Separate (No Change)

```typescript
// Labels NOT instanced (drei <Text> limitation)
{tokenPositions.map(({ token, position }) => (
  <group key={`label-${token.position}`} position={position}>
    <Text position={[0, 0.7, 0]} fontSize={0.25}>
      {token.text}
    </Text>
    <Text position={[0, -0.6, 0]} fontSize={0.12}>
      {token.id}
    </Text>
  </group>
))}
```

**Rationale:**
- Text needs dynamic content (token.text varies)
- drei <Text> uses SDF rendering (optimized internally)
- Label count << sphere count (60 labels vs 1440 spheres/sec)

### 5.2 Position Sync

```
useFrame:
  FOR state IN tokenStates.values():
    // Update sphere matrix (as before)

    // Update label position (separate ref)
    labelPosition ← labelPositions.get(state.tokenId)
    IF labelPosition:
      labelPosition.copy(tempPos)  // Same position as sphere
```

---

## 6. Glow Effect Optimization

### 6.1 Opacity Problem

**Issue:** InstancedMesh does NOT support per-instance opacity via material

**Solutions:**

**Option A: Instance Color Attribute (Recommended)**
```typescript
// Setup
const colors = new Float32Array(capacity × 3);
const alphas = new Float32Array(capacity);
glowMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
glowMesh.geometry.setAttribute('alpha', new THREE.InstancedBufferAttribute(alphas, 1));

// Custom shader
const glowMaterial = new MeshBasicMaterial({
  transparent: true,
  onBeforeCompile: (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      attribute float alpha;
      varying float vAlpha;
      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vAlpha = alpha;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vAlpha;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a * vAlpha );'
    );
  }
});
```

**Option B: Visibility Toggle (Simpler)**
```typescript
// Just hide/show glow instances
IF NOT state.isGenerating:
  glowMesh.setMatrixAt(state.instanceIndex, hiddenMatrix)
ELSE:
  glowMesh.setMatrixAt(state.instanceIndex, visibleMatrix)
```

**Decision:** Use Option B initially (simpler), upgrade to Option A if needed

---

## 7. Performance Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Geometry Created | 1,440/sec | 4 total | -99.7% |
| Draw Calls (12 tokens) | 24 | 4 | -83% |
| React Renders (60fps) | 12 × 60 | 0 | -100% |
| Memory (12 tokens) | ~15MB | ~0.5MB | -97% |
| Context Lost | 12+ tokens | Never | ✓ |

**Test Case:** 30 tokens, inferring state, 60 FPS for 10 seconds

---

## 8. File Change Matrix

| File | Change Type | Lines Affected | Risk |
|------|-------------|----------------|------|
| `EmbeddingAnimation.tsx` | Major Refactor | 1-115 | HIGH |
| `TokenSphere.tsx` | DELETE | - | LOW |
| `SphereInstancePool.tsx` | NEW | ~150 | MEDIUM |
| `inference.ts` (store) | No Change | - | - |

---

## 9. Implementation Phases

### Phase 1: Pool Setup (2h)
```
1. Create SphereInstancePool.tsx
2. Initialize 4 meshes in EmbeddingAnimation
3. Test rendering (static positions)
```

### Phase 2: Matrix Updates (3h)
```
4. Migrate animation state to Map<tokenId, state>
5. Implement UpdateTokenMatrices in useFrame
6. Remove TokenSphere component
```

### Phase 3: Labels (1h)
```
7. Move <Text> to sibling component
8. Sync label positions with sphere matrices
```

### Phase 4: Glow Effect (2h)
```
9. Implement visibility toggle
10. Test pulse animation
11. (Optional) Upgrade to alpha attribute
```

### Phase 5: Testing (2h)
```
12. Memory profiling (Chrome DevTools)
13. Context Lost stress test (50+ tokens)
14. FPS monitoring (stats.js)
```

**Total Estimate:** 10 hours

---

## 10. Code Review Checklist

- [ ] No `<sphereGeometry>` in render tree
- [ ] All 4 meshes created in useEffect (once)
- [ ] Matrix updates in useFrame (no setState)
- [ ] Unused instances hidden via hiddenMatrix
- [ ] Labels remain separate (drei <Text>)
- [ ] Glow visibility toggled (not opacity animated)
- [ ] Capacity set to MAX_TOKENS (not dynamic)
- [ ] Geometry/Material disposed on unmount

---

## 11. Rollback Strategy

IF Context Lost persists:
1. Check GPU memory (Chrome Task Manager)
2. Reduce MAX_TOKENS capacity
3. Feature flag: `USE_INSTANCED_SPHERES=false`
4. Restore TokenSphere.tsx from git

---

## 12. Existing Pattern Reference

### TokenLayer.tsx (Lines 19-92)
```typescript
// ✅ CORRECT: Persistent mesh pattern
useEffect(() => {
  const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);
  const mesh = new THREE.InstancedMesh(geometry, material, MAX_TOKENS);

  for (let i = 0; i < MAX_TOKENS; i++) {
    mesh.setMatrixAt(i, hiddenMatrix);
  }

  scene.add(mesh);

  return () => {
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
  };
}, [scene]);

// Update matrices on token change
useEffect(() => {
  tokens.forEach((_, i) => {
    matrix.setPosition(i × TOKEN_SPACING - offset, EMBEDDING_Y, 0);
    mesh.setMatrixAt(i, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
}, [tokens]);
```

### TokenJourney.tsx (Lines 226-242)
```typescript
// ✅ CORRECT: InstancedMesh with matrix updates
{LAYER_VISUALS.map((visual, layerIdx) => (
  <instancedMesh
    key={layerIdx}
    ref={(el) => { layerMeshRefs.current[layerIdx] = el; }}
    args={[undefined, undefined, allTokens.length]}
  >
    <sphereGeometry args={[0.35, visual.segments, visual.segments]} />
    <meshStandardMaterial color={visual.color} />
  </instancedMesh>
))}
```

---

## 13. References

- **Style Authority:** `/Users/mac/Desktop/project/Sruimeng/sophon/llmdoc/reference/style-hemingway.md`
- **Performance Strategy:** `/Users/mac/Desktop/project/Sruimeng/sophon/llmdoc/agent/strategy-performance-optimization.md`
- **THREE.js InstancedMesh:** https://threejs.org/docs/#api/en/objects/InstancedMesh
- **Instance Attributes:** https://threejs.org/examples/#webgl_instancing_dynamic

---

**End Strategy** - Ready for `/sr:do` execution
