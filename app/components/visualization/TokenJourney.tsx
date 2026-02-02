import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import { TOKEN_SPACING, LAYER_COUNT } from '~/constants/inference';
import { AttentionLines } from './AttentionLines';
import { useGeometryRegistry } from '~/lib/three/resource-manager';

const LAYER_HEIGHT = 3;
const LAYER_GAP = 0.5;
const ANIMATION_SPEED = 0.04;
const MAX_VISIBLE_TOKENS = 20;

const LAYER_NAMES = [
  'Embedding Layer',
  'Transformer Block 1',
  'Transformer Block 2',
  'Transformer Block 3',
  'LM Head (Output)',
];

const LAYER_DESCRIPTIONS = [
  'Token IDs → 高维向量',
  'Self-Attention + FFN',
  'Self-Attention + FFN',
  'Self-Attention + FFN',
  'Logits → Sampling',
];

const LAYER_VISUALS = [
  { scale: 0.3, segments: 4, color: '#8b5cf6', emissive: 0.2 },
  { scale: 0.38, segments: 8, color: '#3b82f6', emissive: 0.4 },
  { scale: 0.42, segments: 12, color: '#06b6d4', emissive: 0.5 },
  { scale: 0.45, segments: 16, color: '#10b981', emissive: 0.6 },
  { scale: 0.5, segments: 24, color: '#f59e0b', emissive: 0.8 },
];

type TokenPhase = 'moving' | 'attention' | 'ffn';

interface TokenState {
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  currentLayer: number;
  isComplete: boolean;
  phase: TokenPhase;
  phaseStartTime: number;
}

const ATTENTION_DURATION = 750;
const FFN_DURATION = 750;
const FFN_PULSE_AMPLITUDE = 0.2;

const matrix = new THREE.Matrix4();
const hiddenMatrix = new THREE.Matrix4();
hiddenMatrix.setPosition(0, 1000, 0);

export function TokenJourney() {
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const status = useInferenceStore((s) => s.status);
  const setCurrentLayer = useInferenceStore((s) => s.setCurrentLayer);
  const { invalidate, clock } = useThree();

  const layerMeshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const [tokenStates, setTokenStates] = useState<TokenState[]>([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(-1);
  const [showLayerLabel, setShowLayerLabel] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TokenPhase>('moving');
  const prevPhaseRef = useRef<TokenPhase>('moving');
  const prevLayerRef = useRef<number>(-1);
  const matrixDirtyRef = useRef<boolean>(true);

  const visibleInputTokens = useMemo(
    () => tokens.slice(0, MAX_VISIBLE_TOKENS),
    [tokens]
  );
  const visibleGenTokens = useMemo(
    () => generatedTokens.slice(0, MAX_VISIBLE_TOKENS - visibleInputTokens.length),
    [generatedTokens, visibleInputTokens.length]
  );
  const allTokens = useMemo(
    () => [...visibleInputTokens, ...visibleGenTokens],
    [visibleInputTokens, visibleGenTokens]
  );

  const getLayerY = useCallback((layer: number) => {
    return 2 - layer * (LAYER_HEIGHT + LAYER_GAP);
  }, []);

  // Initialize states
  useEffect(() => {
    if (allTokens.length === 0 || status === 'idle') {
      setTokenStates([]);
      setActiveLayerIndex(-1);
      return;
    }

    const totalWidth = allTokens.length * TOKEN_SPACING;
    const startX = -totalWidth / 2;

    const states = allTokens.map((_, index) => {
      const x = startX + index * TOKEN_SPACING;
      return {
        position: new THREE.Vector3(x, 10, -2),
        targetPosition: new THREE.Vector3(x, getLayerY(0), 0),
        currentLayer: -1,
        isComplete: false,
        phase: 'moving' as TokenPhase,
        phaseStartTime: 0,
      };
    });

    setTokenStates(states);
    matrixDirtyRef.current = true;
  }, [allTokens.length, getLayerY, status]);

  useFrame(() => {
    if (tokenStates.length === 0) return;

    const now = clock.getElapsedTime() * 1000;
    let needsUpdate = false;
    let minLayer = Infinity;
    let phaseForDisplay: TokenPhase = 'moving';

    tokenStates.forEach((state) => {
      if (state.isComplete) return;

      const dist = state.position.distanceTo(state.targetPosition);

      if (dist < 0.2) {
        const elapsed = now - state.phaseStartTime;

        if (state.phase === 'moving' && state.currentLayer < LAYER_COUNT + 1) {
          state.phase = 'attention';
          state.phaseStartTime = now;
          state.currentLayer++;

          if (state.currentLayer >= 0 && state.currentLayer <= LAYER_COUNT + 1) {
            setActiveLayerIndex(state.currentLayer);
            setShowLayerLabel(true);
          }
        } else if (state.phase === 'attention' && elapsed > ATTENTION_DURATION) {
          state.phase = 'ffn';
          state.phaseStartTime = now;
        } else if (state.phase === 'ffn' && elapsed > FFN_DURATION) {
          state.phase = 'moving';
          state.phaseStartTime = now;

          if (state.currentLayer <= LAYER_COUNT + 1) {
            state.targetPosition.y = getLayerY(state.currentLayer);
          }

          if (state.currentLayer > LAYER_COUNT + 1) {
            state.isComplete = true;
          }
        }

        if (state.phase !== 'moving') {
          phaseForDisplay = state.phase;
        }
      } else {
        state.position.lerp(state.targetPosition, ANIMATION_SPEED);
        needsUpdate = true;
      }

      minLayer = Math.min(minLayer, Math.max(0, state.currentLayer));
    });

    // 只在phase真正变化时更新state
    if (phaseForDisplay !== prevPhaseRef.current) {
      prevPhaseRef.current = phaseForDisplay;
      setCurrentPhase(phaseForDisplay);
    }

    if (phaseForDisplay === 'moving' && showLayerLabel) {
      setShowLayerLabel(false);
    }

    // 只在需要时更新matrix (移动中、FFN脉冲、或初始化)
    const hasFfnPulse = tokenStates.some(s => s.phase === 'ffn' && !s.isComplete);
    if (needsUpdate || matrixDirtyRef.current || hasFfnPulse) {
      LAYER_VISUALS.forEach((_, layerIdx) => {
        const mesh = layerMeshRefs.current[layerIdx];
        if (!mesh) return;

        tokenStates.forEach((state, tokenIdx) => {
          if (state.isComplete || state.currentLayer !== layerIdx) {
            mesh.setMatrixAt(tokenIdx, hiddenMatrix);
          } else {
            matrix.identity();
            const visual = LAYER_VISUALS[layerIdx];

            let scale = visual.scale / 0.35;
            if (state.phase === 'ffn') {
              const elapsed = now - state.phaseStartTime;
              const t = elapsed / FFN_DURATION;
              scale *= 1 + FFN_PULSE_AMPLITUDE * Math.sin(t * Math.PI * 2);
            }

            matrix.makeScale(scale, scale, scale);
            matrix.setPosition(state.position);
            mesh.setMatrixAt(tokenIdx, matrix);
          }
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
      matrixDirtyRef.current = false;
    }

    if (minLayer >= 0 && minLayer !== prevLayerRef.current) {
      prevLayerRef.current = minLayer;
      setCurrentLayer(minLayer);
    }
    if (needsUpdate || phaseForDisplay !== 'moving') invalidate();
  });

  return (
    <group>
      <LayerBoxes activeLayer={activeLayerIndex} />
      <AttentionLines phase={currentPhase} />

      {showLayerLabel && activeLayerIndex >= 0 && activeLayerIndex < LAYER_NAMES.length && (
        <Html
          position={[0, getLayerY(activeLayerIndex) + 1.5, 2]}
          center
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '12px 20px',
            borderRadius: '8px',
            border: `1px solid ${LAYER_VISUALS[activeLayerIndex]?.color || '#3b82f6'}`,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ color: LAYER_VISUALS[activeLayerIndex]?.color || '#60a5fa', fontSize: '16px', fontWeight: 'bold' }}>
            {LAYER_NAMES[activeLayerIndex]}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
            {LAYER_DESCRIPTIONS[activeLayerIndex]}
          </div>
        </Html>
      )}

      <SphereInstances
        layerMeshRefs={layerMeshRefs}
        tokenCount={allTokens.length}
      />
    </group>
  );
}

// Separate component to handle instance lifecycle
function SphereInstances({
  layerMeshRefs,
  tokenCount,
}: {
  layerMeshRefs: { current: (THREE.InstancedMesh | null)[] };
  tokenCount: number;
}) {
  const registry = useGeometryRegistry();

  const geometries = useMemo(() =>
    LAYER_VISUALS.map((visual, i) =>
      registry.getSphere(`token-sphere-${i}`, 0.35, visual.segments)
    ), [registry]
  );

  const materials = useMemo(() =>
    LAYER_VISUALS.map((visual, i) =>
      registry.getMaterial(`token-material-${i}`, () =>
        new THREE.MeshStandardMaterial({
          color: visual.color,
          emissive: visual.color,
          emissiveIntensity: visual.emissive,
          metalness: 0.3,
          roughness: 0.4,
        })
      )
    ), [registry]
  );

  return (
    <>
      {LAYER_VISUALS.map((_, layerIdx) => (
        <instancedMesh
          key={layerIdx}
          ref={(el) => { layerMeshRefs.current[layerIdx] = el; }}
          args={[
            geometries[layerIdx],
            materials[layerIdx],
            Math.max(tokenCount, MAX_VISIBLE_TOKENS)
          ]}
          frustumCulled={false}
        />
      ))}
    </>
  );
}

function LayerBoxes({ activeLayer }: { activeLayer: number }) {
  const registry = useGeometryRegistry();
  const boxGeometry = registry.getBox('layer-box', 16, LAYER_HEIGHT, 5);

  const layers = useMemo(() => {
    const result = [];
    for (let i = 0; i <= LAYER_COUNT + 1; i++) {
      result.push({
        y: 2 - i * (LAYER_HEIGHT + LAYER_GAP),
        index: i,
      });
    }
    return result;
  }, []);

  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(boxGeometry),
    [boxGeometry]
  );

  useEffect(() => {
    return () => {
      edgesGeometry.dispose();
    };
  }, [edgesGeometry]);

  return (
    <group>
      {layers.map((layer) => {
        const isActive = layer.index === activeLayer;
        const isPast = layer.index < activeLayer;
        const visual = LAYER_VISUALS[layer.index] || LAYER_VISUALS[0];
        const boxColor = isActive ? visual.color : isPast ? '#1e40af' : '#1e293b';

        return (
          <group key={layer.index} position={[0, layer.y, 0]}>
            <mesh geometry={boxGeometry}>
              <meshStandardMaterial
                color={boxColor}
                transparent
                opacity={isActive ? 0.25 : isPast ? 0.15 : 0.08}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {isActive && (
              <lineSegments geometry={edgesGeometry}>
                <lineBasicMaterial color={visual.color} transparent opacity={0.8} />
              </lineSegments>
            )}
          </group>
        );
      })}
    </group>
  );
}
