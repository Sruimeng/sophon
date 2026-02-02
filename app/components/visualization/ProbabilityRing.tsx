import { useMemo, useEffect } from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TokenCandidate } from '~/types/inference';
import { computeRingSegments, RING_RADIUS, RING_THICKNESS } from '~/lib/three/ring-math';
import type { RingSegment } from '~/lib/three/ring-math';

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
  const geometry = useMemo(() => {
    const torus = new THREE.TorusGeometry(
      RING_RADIUS,
      RING_THICKNESS,
      16,
      64,
      segment.arcAngle
    );
    torus.rotateY(segment.centerAngle - segment.arcAngle / 2);
    return torus;
  }, [segment.centerAngle, segment.arcAngle]);

  // Cleanup geometry on unmount or when geometry changes
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

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
        <Text
          fontSize={0.1}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.25, 0]}
        >
          {(segment.probability * 100).toFixed(1)}%
        </Text>
      </Billboard>
    </>
  );
}
