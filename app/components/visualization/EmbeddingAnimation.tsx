import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import { SphereInstancePool } from './SphereInstancePool';
import { TOKEN_SPACING } from '~/constants/inference';

const ANIMATION_DURATION = 800;
const STAGGER_DELAY = 200;

type PoolType = 'input' | 'generated';

interface SpherePool {
  mainMesh: THREE.InstancedMesh;
  glowMesh: THREE.InstancedMesh;
  capacity: number;
  type: PoolType;
}

interface SpherePoolRegistry {
  input: SpherePool;
  generated: SpherePool;
}

interface TokenInstanceState {
  tokenId: number;
  instanceIndex: number;
  poolType: PoolType;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentProgress: number;
  isGenerating: boolean;
  startTime: number;
}

// Module-scope objects (reused in useFrame)
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const hiddenMatrix = new THREE.Matrix4().setPosition(0, -1000, 0);

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export function EmbeddingAnimation() {
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const status = useInferenceStore((s) => s.status);

  const poolsRef = useRef<SpherePoolRegistry | null>(null);
  const tokenStates = useRef<Map<number, TokenInstanceState>>(new Map());
  const recycledIndices = useRef<{ input: Set<number>; generated: Set<number> }>({
    input: new Set(),
    generated: new Set(),
  });
  const startTimeRef = useRef<number>(0);

  const allTokens = useMemo(
    () => [...tokens, ...generatedTokens],
    [tokens, generatedTokens]
  );

  // Allocate instance index
  const allocateIndex = useCallback((poolType: PoolType): number => {
    const recycled = recycledIndices.current[poolType];
    if (recycled.size > 0) {
      const index = Array.from(recycled)[0];
      recycled.delete(index);
      return index;
    }

    // Count instances of this pool type
    let maxIndex = -1;
    tokenStates.current.forEach((state) => {
      if (state.poolType === poolType && state.instanceIndex > maxIndex) {
        maxIndex = state.instanceIndex;
      }
    });
    return maxIndex + 1;
  }, []);

  // Handle token changes
  useEffect(() => {
    if (allTokens.length === 0 || !poolsRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = performance.now();
    }

    const totalWidth = allTokens.length * TOKEN_SPACING;
    const startX = -totalWidth / 2;
    const currentTokenIds = new Set(allTokens.map((t) => t.position));

    // Remove deleted tokens
    tokenStates.current.forEach((state, tokenId) => {
      if (!currentTokenIds.has(tokenId)) {
        const pool = poolsRef.current![state.poolType];
        pool.mainMesh.setMatrixAt(state.instanceIndex, hiddenMatrix);
        pool.glowMesh.setMatrixAt(state.instanceIndex, hiddenMatrix);
        pool.mainMesh.instanceMatrix.needsUpdate = true;
        pool.glowMesh.instanceMatrix.needsUpdate = true;
        recycledIndices.current[state.poolType].add(state.instanceIndex);
        tokenStates.current.delete(tokenId);
      }
    });

    // Update or create states
    allTokens.forEach((token, i) => {
      const isGenerated = i >= tokens.length;
      const poolType: PoolType = isGenerated ? 'generated' : 'input';
      const targetX = startX + i * TOKEN_SPACING;

      if (!tokenStates.current.has(token.position)) {
        // New token
        const state: TokenInstanceState = {
          tokenId: token.position,
          instanceIndex: allocateIndex(poolType),
          poolType,
          startPos: new THREE.Vector3(targetX, 8, -5),
          targetPos: new THREE.Vector3(targetX, 0, 0),
          currentProgress: 0,
          isGenerating: isGenerated && status === 'inferring',
          startTime: startTimeRef.current + i * STAGGER_DELAY,
        };
        tokenStates.current.set(token.position, state);
      } else {
        // Update existing
        const state = tokenStates.current.get(token.position)!;
        state.targetPos.set(targetX, 0, 0);
        state.isGenerating = isGenerated && status === 'inferring';
      }
    });
  }, [allTokens, tokens.length, status, allocateIndex]);

  // Matrix updates in useFrame
  useFrame((state) => {
    if (!poolsRef.current) return;

    const elapsed = state.clock.elapsedTime * 1000;

    tokenStates.current.forEach((tokenState) => {
      const pool = poolsRef.current![tokenState.poolType];

      // Update progress
      if (tokenState.currentProgress < 1) {
        const tokenElapsed = Math.max(0, elapsed - (tokenState.startTime - startTimeRef.current));
        const t = tokenElapsed / ANIMATION_DURATION;
        tokenState.currentProgress = clamp(t, 0, 1);
      }

      // Interpolate position
      const progress = easeOutCubic(tokenState.currentProgress);
      tempPos.lerpVectors(tokenState.startPos, tokenState.targetPos, progress);

      // Calculate scale (pulse for generating)
      let baseScale = 1.0;
      let showGlow = false;

      if (tokenState.isGenerating) {
        const phase = elapsed * 0.004;
        const pulse = Math.sin(phase) * 0.1 + 1.0;
        baseScale = pulse;
        showGlow = true;
      }

      // Update main sphere
      tempMatrix.identity();
      tempMatrix.makeScale(baseScale, baseScale, baseScale);
      tempMatrix.setPosition(tempPos);
      pool.mainMesh.setMatrixAt(tokenState.instanceIndex, tempMatrix);

      // Update glow sphere
      if (showGlow) {
        tempMatrix.identity();
        tempMatrix.makeScale(baseScale * 1.5, baseScale * 1.5, baseScale * 1.5);
        tempMatrix.setPosition(tempPos);
        pool.glowMesh.setMatrixAt(tokenState.instanceIndex, tempMatrix);
      } else {
        pool.glowMesh.setMatrixAt(tokenState.instanceIndex, hiddenMatrix);
      }
    });

    // Mark for GPU update
    if (poolsRef.current) {
      poolsRef.current.input.mainMesh.instanceMatrix.needsUpdate = true;
      poolsRef.current.input.glowMesh.instanceMatrix.needsUpdate = true;
      poolsRef.current.generated.mainMesh.instanceMatrix.needsUpdate = true;
      poolsRef.current.generated.glowMesh.instanceMatrix.needsUpdate = true;
    }
  });

  const handlePoolsReady = useCallback((pools: SpherePoolRegistry) => {
    poolsRef.current = pools;
  }, []);

  // Calculate label positions
  const labelPositions = useMemo(() => {
    const totalWidth = allTokens.length * TOKEN_SPACING;
    const startX = -totalWidth / 2;

    return allTokens.map((token, i) => ({
      token,
      position: [startX + i * TOKEN_SPACING, 0, 0] as [number, number, number],
    }));
  }, [allTokens]);

  return (
    <group>
      <SphereInstancePool onPoolsReady={handlePoolsReady} />
      {labelPositions.map(({ token, position }) => (
        <group key={`label-${token.position}`} position={position}>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {token.text}
          </Text>
          <Text
            position={[0, -0.6, 0]}
            fontSize={0.12}
            color="#9ca3af"
            anchorX="center"
            anchorY="top"
          >
            {token.id}
          </Text>
        </group>
      ))}
    </group>
  );
}
