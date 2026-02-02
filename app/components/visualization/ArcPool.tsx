import { useMemo, useRef } from 'react';
import type { ArcGeometry } from '~/lib/three/arc-math';

export const MAX_ARCS = 100;

export interface ArcRef {
  geometry: ArcGeometry | null;
  visible: boolean;
  opacity: number;
}

export interface ArcPool {
  refs: ArcRef[];
  active: Set<number>;
  allocate: (geometry: ArcGeometry) => number | null;
  release: (index: number) => void;
  clear: () => void;
}

function createEmptyArc(): ArcRef {
  return {
    geometry: null,
    visible: false,
    opacity: 0,
  };
}

export function useArcPool(maxSize: number = MAX_ARCS): ArcPool {
  const refs = useMemo(
    () => Array.from({ length: maxSize }, createEmptyArc),
    [maxSize]
  );

  const active = useRef(new Set<number>());

  const allocate = (geometry: ArcGeometry): number | null => {
    const idx = refs.findIndex((_, i) => !active.current.has(i));
    if (idx === -1) return null;

    refs[idx].geometry = geometry;
    refs[idx].visible = true;
    refs[idx].opacity = 0;
    active.current.add(idx);

    return idx;
  };

  const release = (index: number) => {
    if (index < 0 || index >= refs.length) return;

    refs[index].geometry = null;
    refs[index].visible = false;
    refs[index].opacity = 0;
    active.current.delete(index);
  };

  const clear = () => {
    active.current.forEach(release);
    active.current.clear();
  };

  return { refs, active: active.current, allocate, release, clear };
}
