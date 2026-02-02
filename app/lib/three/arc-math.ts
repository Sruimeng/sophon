import * as THREE from 'three';
import type { AttentionWeight } from '~/types/inference';

export const MAX_ARC_HEIGHT = 1.5;
export const MIN_WEIGHT_THRESHOLD = 0.1;

export interface ArcGeometry {
  start: THREE.Vector3;
  control: THREE.Vector3;
  end: THREE.Vector3;
  weight: number;
  layer: number;
}

export function computeArcGeometry(
  attention: AttentionWeight,
  positions: THREE.Vector3[]
): ArcGeometry {
  const start = positions[attention.query];
  const end = positions[attention.key];

  const mid = new THREE.Vector3(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    (start.z + end.z) / 2
  );

  const height = attention.weight * MAX_ARC_HEIGHT;
  const control = new THREE.Vector3(mid.x, mid.y + height, mid.z);

  return {
    start: start.clone(),
    control,
    end: end.clone(),
    weight: attention.weight,
    layer: attention.layer,
  };
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}
