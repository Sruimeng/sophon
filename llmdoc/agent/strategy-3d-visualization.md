---
id: strategy-3d-visualization
type: strategy
related_ids: [constitution, style-hemingway, tech-stack]
---

# Strategy: 3D Visualization Enhancement

## 1. Context

**Current State:**
- 5-layer vertical animation with 1500ms layer pause
- AttentionLines: Flat 2D lines at same Y-coordinate
- Mock attention: Gaussian distance falloff, no visual arcs
- TokenJourney: Single-phase per layer (move + pause)
- No LM Head visualization, no probability ring

**Data Available:**
```typescript
interface AttentionWeight {
  query: number;   // token index
  key: number;     // token index
  weight: number;  // 0-1
  layer: number;   // 0-4
}

interface TokenCandidate {
  token: string;
  probability: number;
  tokenId: number;
}
```

**Gap:**
1. Attention is computed but not visualized (arcs)
2. Layer pause is idle (no sub-phase animations)
3. LM Head has no output distribution ring

## 2. Constitution Compliance

**From Librarian Report:**

**Rule 1: drei Components**
```typescript
import { QuadraticBezierLine } from '@react-three/drei';
import { Billboard } from '@react-three/drei';
import { Instances, Instance } from '@react-three/drei';
```

**Rule 2: Instancing for >50 Objects**
```typescript
// ✅ CORRECT: Use Instances for arcs
<Instances limit={100}>
  {arcs.map(arc => <Instance key={arc.id} />)}
</Instances>

// ❌ WRONG: Individual components
{arcs.map(arc => <QuadraticBezierLine key={arc.id} />)}
```

**Rule 3: Performance Target**
- Draw calls: <200
- Use `ref.setPoints()` instead of props for dynamic updates

**Rule 4: Hemingway Style**
- Type-first design
- Early returns, max nesting 3
- No "what" comments
- Pseudocode in MathSpec

**Rule 5: Forbidden Patterns**
- ❌ `any` type
- ❌ `Line2` for many lines (use QuadraticBezierLine)
- ❌ Derived state in Zustand store

**Style Protocol:**
Strict adherence to `llmdoc/reference/style-hemingway.md`:
- Iceberg Principle: Types explain structure, code shows logic
- No fluff words (AbstractManager, DataInfo)
- Function length <30 lines
- Boolean naming: is/has/can/should

## 3. Negative Constraints

🚫 **DO NOT:**
1. Create `new` objects in render loops (use object pools)
2. Update arc props per frame (use `ref.setPoints()`)
3. Render >50 arcs without instancing
4. Add verbose comments ("Loop through arcs")
5. Store derived state (e.g., `arcHeight = weight * MAX_HEIGHT`)
6. Use `any` type for arc refs or animation state
7. Nest animation logic >3 levels deep

✅ **DO:**
1. Pre-allocate arc refs array
2. Use `useFrame` with early returns
3. Extract sub-phase logic to pure functions
4. Type all animation states explicitly
5. Use Billboard for labels (auto-facing camera)

## 4. Assessment

<Assessment>
**Complexity:** Level 3 (Graphics + Animation)
**Reasoning:**
- Bezier curve math for arc control points
- Ring geometry with arc segment calculation
- Sub-phase state machine with timing functions
- Performance-critical rendering (instancing, ref updates)
</Assessment>

## 5. Math/Algo Specification

<MathSpec>

### 5.1 Bezier Arc Control Point

**Given:** Query position `Q = (x1, y1, z1)`, Key position `K = (x2, y2, z2)`, Weight `w ∈ [0,1]`

**Compute:**
```
Midpoint = M = ((x1 + x2)/2, (y1 + y2)/2, (z1 + z2)/2)
ArcHeight = h = w * MAX_ARC_HEIGHT
ControlPoint = C = (M.x, M.y + h, M.z)

BezierCurve(t) = (1-t)²Q + 2(1-t)t·C + t²K  // t ∈ [0,1]
```

**Constants:**
```typescript
const MAX_ARC_HEIGHT = 1.5;  // World units
const MIN_WEIGHT_THRESHOLD = 0.1;  // Filter weak attention
```

### 5.2 Ring Arc Segment Geometry

**Given:** Top-K candidates `{token, prob}[]`, Ring radius `R`

**Compute:**
```
TotalAngle = 2π
StartAngle[0] = 0

For i = 0 to K-1:
  ArcLength[i] = prob[i] * TotalAngle
  StartAngle[i+1] = StartAngle[i] + ArcLength[i]

  SegmentGeometry[i] = {
    centerAngle: (StartAngle[i] + StartAngle[i+1]) / 2
    x: R * cos(centerAngle)
    z: R * sin(centerAngle)
    arcAngle: ArcLength[i]
  }
```

**Constants:**
```typescript
const RING_RADIUS = 2.0;
const RING_THICKNESS = 0.1;
const TOP_K = 8;  // Show top 8 candidates
```

### 5.3 Sub-Phase Timing

**Given:** Layer pause duration `D = 1500ms`

**Phases:**
```
AttentionPhase:  t ∈ [0, D/2]     // 0-750ms
  ArcOpacity(t) = easeInOut(t / (D/2))  // 0 → 1

FFNPhase:        t ∈ [D/2, D]     // 750-1500ms
  ArcOpacity(t) = easeInOut((t - D/2) / (D/2))  // 1 → 0
  TokenScale(t) = 1 + 0.2 * sin(2π * (t - D/2) / (D/2))  // Pulse
  TokenHue(t) = lerp(hue_start, hue_end, (t - D/2) / (D/2))  // Warm → Cool
```

**Easing:**
```
easeInOut(t) = t < 0.5
  ? 2 * t²
  : 1 - 2 * (1-t)²
```

### 5.4 Arc Pooling

**Object Pool Pattern:**
```
Pool = Array<ArcRef>(MAX_ARCS)  // Pre-allocated
ActiveArcs = Set<number>        // Indices in use

Allocate():
  idx = Pool.findIndex(ref => !ActiveArcs.has(idx))
  ActiveArcs.add(idx)
  return Pool[idx]

Release(idx):
  Pool[idx].visible = false
  ActiveArcs.delete(idx)
```

**Constants:**
```typescript
const MAX_ARCS = 100;  // Pool size
const ARCS_PER_LAYER = 20;  // Estimated max
```

</MathSpec>

## 6. Phase 1: Curved Attention Arcs

**Goal:** Replace flat AttentionLines with 3D arcs during layer pause.

### 6.1 Data Flow

```
AttentionStore (existing)
  ↓
FilterAttention(layer, minWeight=0.1)
  ↓
ComputeArcGeometry(queryPos, keyPos, weight)
  ↓
ArcPool.allocate() → ArcRef
  ↓
ref.setPoints([start, control, end])
  ↓
AnimateOpacity(0→1) during AttentionPhase
```

### 6.2 Type Definitions

```typescript
interface ArcGeometry {
  start: Vector3;
  control: Vector3;
  end: Vector3;
  weight: number;
  layer: number;
}

interface ArcRef {
  ref: RefObject<QuadraticBezierLineProps>;
  geometry: ArcGeometry;
  visible: boolean;
  opacity: number;
}

interface ArcPool {
  refs: ArcRef[];
  active: Set<number>;
  allocate: (geometry: ArcGeometry) => number | null;
  release: (index: number) => void;
}
```

### 6.3 Implementation Steps

**Step 1:** Create `ArcPool.tsx`
```typescript
function useArcPool(maxSize: number): ArcPool {
  const refs = useMemo(() =>
    Array.from({ length: maxSize }, createEmptyArc),
    [maxSize]
  );

  const active = useRef(new Set<number>());

  return { refs, active: active.current, allocate, release };
}
```

**Step 2:** Refactor `AttentionLines.tsx`
```typescript
function AttentionLines({ layer, phase }: Props) {
  const pool = useArcPool(MAX_ARCS);
  const attention = useAttentionStore(s => s.weights);

  const filtered = useMemo(() =>
    attention.filter(a => a.layer === layer && a.weight > 0.1),
    [attention, layer]
  );

  useEffect(() => {
    if (phase !== 'attention') return;

    const indices = filtered.map(a => {
      const geometry = computeArcGeometry(a);
      return pool.allocate(geometry);
    });

    return () => indices.forEach(pool.release);
  }, [filtered, phase]);

  useFrame((_, delta) => {
    if (phase !== 'attention') return;

    pool.refs.forEach((arc, i) => {
      if (!pool.active.has(i)) return;
      arc.opacity = Math.min(arc.opacity + delta * 2, 1);
    });
  });

  return (
    <Instances limit={MAX_ARCS}>
      <meshBasicMaterial transparent />
      {pool.refs.map((arc, i) => (
        <Instance
          key={i}
          visible={pool.active.has(i)}
          opacity={arc.opacity}
        />
      ))}
    </Instances>
  );
}
```

**Step 3:** Extract `computeArcGeometry`
```typescript
function computeArcGeometry(
  attention: AttentionWeight,
  positions: Vector3[]
): ArcGeometry {
  const start = positions[attention.query];
  const end = positions[attention.key];

  const mid = start.clone().lerp(end, 0.5);
  const height = attention.weight * MAX_ARC_HEIGHT;
  const control = mid.clone().setY(mid.y + height);

  return { start, control, end, weight: attention.weight, layer: attention.layer };
}
```

## 7. Phase 2: Sub-Phase Animation

**Goal:** Split layer pause into Attention + FFN phases with distinct visuals.

### 7.1 State Machine

```
Current: TokenJourney = 'moving' | 'paused'
New:     TokenPhase = 'moving' | 'attention' | 'ffn'

Transitions:
  moving → attention  (on layer arrival)
  attention → ffn     (after 750ms)
  ffn → moving        (after 1500ms total)
```

### 7.2 Type Definitions

```typescript
type TokenPhase = 'moving' | 'attention' | 'ffn';

interface TokenState {
  phase: TokenPhase;
  phaseTime: number;  // ms elapsed in current phase
  layer: number;
}

interface LayerTimings {
  attention: number;  // 750ms
  ffn: number;        // 750ms
}

const LAYER_TIMINGS: LayerTimings = {
  attention: 750,
  ffn: 750,
};
```

### 7.3 Implementation Steps

**Step 1:** Extend `TokenJourney.tsx` state
```typescript
function TokenJourney() {
  const [phase, setPhase] = useState<TokenPhase>('moving');
  const [phaseTime, setPhaseTime] = useState(0);

  useFrame((_, delta) => {
    const deltaMs = delta * 1000;

    if (phase === 'moving') {
      // Existing movement logic
      if (reachedLayer) {
        setPhase('attention');
        setPhaseTime(0);
      }
      return;
    }

    if (phase === 'attention') {
      setPhaseTime(t => {
        const next = t + deltaMs;
        if (next >= LAYER_TIMINGS.attention) {
          setPhase('ffn');
          return 0;
        }
        return next;
      });
      return;
    }

    if (phase === 'ffn') {
      setPhaseTime(t => {
        const next = t + deltaMs;
        if (next >= LAYER_TIMINGS.ffn) {
          setPhase('moving');
          return 0;
        }
        return next;
      });
    }
  });

  return (
    <>
      <TokenMesh phase={phase} phaseTime={phaseTime} />
      <AttentionLines phase={phase} />
    </>
  );
}
```

**Step 2:** Create `TokenMesh.tsx` with FFN effects
```typescript
function TokenMesh({ phase, phaseTime }: Props) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    if (phase === 'ffn') {
      const t = phaseTime / LAYER_TIMINGS.ffn;
      const scale = 1 + 0.2 * Math.sin(t * Math.PI * 2);
      meshRef.current.scale.setScalar(scale);

      const hue = lerp(30, 210, t);  // Warm → Cool
      meshRef.current.material.color.setHSL(hue / 360, 0.8, 0.5);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  return <mesh ref={meshRef} />;
}
```

## 8. Phase 3: Probability Distribution Ring

**Goal:** Visualize LM Head output at layer 4 as ring with top-K candidates.

### 8.1 Data Flow

```
TokenCandidates[] (top-K from store)
  ↓
ComputeRingSegments(candidates, radius=2.0)
  ↓
RingSegment[] { centerAngle, arcAngle, label }
  ↓
Render TorusGeometry segments + Billboard labels
```

### 8.2 Type Definitions

```typescript
interface RingSegment {
  token: string;
  probability: number;
  centerAngle: number;  // radians
  arcAngle: number;     // radians
  position: Vector3;
  isSelected: boolean;
}

interface ProbabilityRingProps {
  candidates: TokenCandidate[];
  selectedTokenId: number;
  position: Vector3;
}
```

### 8.3 Implementation Steps

**Step 1:** Create `ProbabilityRing.tsx`
```typescript
function ProbabilityRing({ candidates, selectedTokenId, position }: Props) {
  const segments = useMemo(() =>
    computeRingSegments(candidates, RING_RADIUS),
    [candidates]
  );

  return (
    <group position={position}>
      {segments.map(seg => (
        <RingSegment
          key={seg.token}
          segment={seg}
          isSelected={seg.tokenId === selectedTokenId}
        />
      ))}
    </group>
  );
}
```

**Step 2:** Create `RingSegment.tsx`
```typescript
function RingSegment({ segment, isSelected }: Props) {
  const geometry = useMemo(() => {
    const torus = new TorusGeometry(
      RING_RADIUS,
      RING_THICKNESS,
      16,
      64,
      segment.arcAngle
    );
    torus.rotateY(segment.centerAngle);
    return torus;
  }, [segment]);

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={isSelected ? '#ffff00' : '#4080ff'}
          emissive={isSelected ? '#ff8800' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      <Billboard position={segment.position}>
        <Text
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {segment.token}
        </Text>
      </Billboard>
    </>
  );
}
```

**Step 3:** Extract `computeRingSegments`
```typescript
function computeRingSegments(
  candidates: TokenCandidate[],
  radius: number
): RingSegment[] {
  const sorted = candidates
    .slice(0, TOP_K)
    .sort((a, b) => b.probability - a.probability);

  let startAngle = 0;

  return sorted.map(c => {
    const arcAngle = c.probability * Math.PI * 2;
    const centerAngle = startAngle + arcAngle / 2;

    const position = new Vector3(
      radius * Math.cos(centerAngle),
      0,
      radius * Math.sin(centerAngle)
    );

    startAngle += arcAngle;

    return {
      token: c.token,
      probability: c.probability,
      centerAngle,
      arcAngle,
      position,
      isSelected: false,
    };
  });
}
```

## 9. Implementation Order

**Priority:** Performance-critical first, polish last.

**Block 1: Arc Infrastructure (Day 1)**
1. Create `ArcPool.tsx` with object pooling
2. Extract `computeArcGeometry` to `utils/arc-math.ts`
3. Add unit tests for Bezier math

**Block 2: Arc Rendering (Day 1)**
1. Refactor `AttentionLines.tsx` to use QuadraticBezierLine
2. Implement ref-based point updates
3. Test with 100 arcs, verify <200 draw calls

**Block 3: Sub-Phase State Machine (Day 2)**
1. Extend `TokenJourney.tsx` with phase transitions
2. Create `TokenMesh.tsx` with FFN effects
3. Add phase prop to `AttentionLines.tsx`

**Block 4: Probability Ring (Day 2)**
1. Create `ProbabilityRing.tsx` component
2. Implement `computeRingSegments` logic
3. Add Billboard labels with auto-rotation

**Block 5: Integration (Day 3)**
1. Connect ring to layer 4 arrival event
2. Animate ring appearance (scale 0→1)
3. Polish: glow shader for selected segment

**Block 6: Performance Audit (Day 3)**
1. Profile with Chrome DevTools
2. Verify draw calls <200
3. Test with 12-layer model (future-proofing)

## 10. Testing Strategy

**Unit Tests:**
```typescript
describe('computeArcGeometry', () => {
  it('control point Y increases with weight', () => {
    const result = computeArcGeometry(
      { query: 0, key: 1, weight: 0.8, layer: 0 },
      [new Vector3(0,0,0), new Vector3(1,0,0)]
    );

    expect(result.control.y).toBeCloseTo(0.8 * MAX_ARC_HEIGHT);
  });
});

describe('computeRingSegments', () => {
  it('sum of arc angles equals 2π', () => {
    const segments = computeRingSegments(mockCandidates, 2.0);
    const total = segments.reduce((sum, s) => sum + s.arcAngle, 0);

    expect(total).toBeCloseTo(Math.PI * 2);
  });
});
```

**Integration Tests:**
```typescript
describe('TokenJourney phase transitions', () => {
  it('moves from attention to ffn after 750ms', async () => {
    render(<TokenJourney />);

    await waitFor(() => expect(phase).toBe('attention'));
    await waitFor(() => expect(phase).toBe('ffn'), { timeout: 1000 });
  });
});
```

## 11. Performance Budget

**Target:**
- 60 FPS with 100 arcs + 8 ring segments
- Draw calls: <200
- Memory: <50MB for pooled objects

**Enforcement:**
```typescript
// Add to useFrame debug logging
if (import.meta.env.DEV) {
  const info = renderer.info;
  if (info.render.calls > 200) {
    console.warn(`Draw calls: ${info.render.calls} (budget: 200)`);
  }
}
```

## 12. File Structure

```
app/
└── routes/
    └── visualize/
        ├── components/
        │   ├── TokenJourney.tsx       (Modified: Add phase state)
        │   ├── TokenMesh.tsx          (New: FFN effects)
        │   ├── AttentionLines.tsx     (Modified: Use QuadraticBezierLine)
        │   ├── ArcPool.tsx            (New: Object pooling)
        │   ├── ProbabilityRing.tsx    (New: Ring component)
        │   └── RingSegment.tsx        (New: Segment + label)
        ├── utils/
        │   ├── arc-math.ts            (New: Bezier calculations)
        │   └── ring-math.ts           (New: Segment geometry)
        └── route.tsx
```

## 13. Related Docs

- Constitution: [constitution.md](/Users/mac/Desktop/project/Sruimeng/sophon/llmdoc/reference/constitution.md)
- Style Guide: [style-hemingway.md](/Users/mac/Desktop/project/Sruimeng/sophon/llmdoc/reference/style-hemingway.md)
- Investigator Report: (Context from Commander)
- Librarian Report: (Context from Commander)
