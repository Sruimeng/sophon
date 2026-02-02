import * as THREE from 'three';
import type { TokenCandidate } from '~/types/inference';

export const RING_RADIUS = 2.0;
export const RING_THICKNESS = 0.1;
export const TOP_K = 8;

export interface RingSegment {
  token: string;
  tokenId: number;
  probability: number;
  centerAngle: number;
  arcAngle: number;
  position: THREE.Vector3;
}

export function computeRingSegments(
  candidates: TokenCandidate[],
  radius: number = RING_RADIUS
): RingSegment[] {
  const sorted = candidates
    .slice(0, TOP_K)
    .sort((a, b) => b.probability - a.probability);

  if (sorted.length === 0) return [];

  let startAngle = 0;

  return sorted.map((c) => {
    const arcAngle = c.probability * Math.PI * 2;
    const centerAngle = startAngle + arcAngle / 2;

    const position = new THREE.Vector3(
      radius * Math.cos(centerAngle),
      0,
      radius * Math.sin(centerAngle)
    );

    startAngle += arcAngle;

    return {
      token: c.token,
      tokenId: c.tokenId,
      probability: c.probability,
      centerAngle,
      arcAngle,
      position,
    };
  });
}
