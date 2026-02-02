import { useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { useGeometryRegistry } from '~/lib/three/resource-manager';

interface LayerContainerProps {
  children: ReactNode;
  layer: number;
  yOffset?: number;
}

export function LayerContainer({ children, layer, yOffset = 0 }: LayerContainerProps) {
  const registry = useGeometryRegistry();
  const planeGeometry = registry.getPlane('layer-plane', 20, 20);

  const y = layer * 3 + yOffset;

  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={planeGeometry}>
        <meshStandardMaterial
          color={0x1e293b}
          transparent
          opacity={0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {children}
    </group>
  );
}
