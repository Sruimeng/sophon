import { useMemo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { TokenCandidate } from '~/types/inference';
import { computeRingSegments, RING_RADIUS, RING_THICKNESS } from '~/lib/three/ring-math';
import type { RingSegment } from '~/lib/three/ring-math';
import { useTorusPool } from '~/lib/three/torus-pool';

interface ProbabilityRingProps {
  candidates: TokenCandidate[];
  selectedTokenId: number | null;
  position: THREE.Vector3;
}

export function ProbabilityRing({ candidates, selectedTokenId, position }: ProbabilityRingProps) {
  const segments = useMemo(
    () => computeRingSegments(candidates, RING_RADIUS),
    [candidates]
  );

  if (segments.length === 0) return null;

  return (
    <group position={position}>
      {segments.map((seg, index) => (
        <RingSegmentMesh
          key={`${seg.tokenId}-${index}`}
          segment={seg}
          isSelected={seg.tokenId === selectedTokenId}
        />
      ))}
    </group>
  );
}

interface RingSegmentMeshProps {
  segment: RingSegment;
  isSelected: boolean;
}

function RingSegmentMesh({ segment, isSelected }: RingSegmentMeshProps) {
  const pool = useTorusPool();
  const geometryRef = useRef<THREE.TorusGeometry | null>(null);
  const rotationRef = useRef<number>(0);
  const meshRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = useState(false);
  const targetScale = useRef(1);
  const targetOpacity = useRef(1);

  useEffect(() => {
    setIsVisible(true);
    targetScale.current = 1;
    targetOpacity.current = 1;
    return () => {
      setIsVisible(false);
      targetScale.current = 0.3;
      targetOpacity.current = 0;
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    const currentScale = meshRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(
      currentScale,
      isVisible ? targetScale.current : 0.3,
      0.15
    );
    meshRef.current.scale.setScalar(newScale);

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = THREE.MathUtils.lerp(
      mat.opacity,
      isVisible ? targetOpacity.current : 0,
      0.15
    );
  });

  useEffect(() => {
    const torus = pool.acquire(segment.arcAngle);
    const rotation = segment.centerAngle - segment.arcAngle / 2;

    torus.rotateY(rotation);
    geometryRef.current = torus;
    rotationRef.current = rotation;

    return () => {
      if (geometryRef.current) {
        geometryRef.current.rotateY(-rotationRef.current);
        pool.release(geometryRef.current);
      }
    };
  }, [segment.arcAngle, segment.centerAngle, pool]);

  if (!geometryRef.current) return null;

  return (
    <>
      <mesh ref={meshRef} geometry={geometryRef.current} scale={0.3}>
        <meshStandardMaterial
          color={isSelected ? '#ffff00' : '#4080ff'}
          emissive={isSelected ? '#ff8800' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
          transparent
          opacity={0}
        />
      </mesh>

      <Html
        position={[segment.position.x, segment.position.y, segment.position.z]}
        center
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            {segment.token}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '10px' }}>
            {(segment.probability * 100).toFixed(1)}%
          </div>
        </div>
      </Html>
    </>
  );
}
