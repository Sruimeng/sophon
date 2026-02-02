import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import { TOKEN_SPACING, EMBEDDING_Y } from '~/constants/inference';

export function TokenLayer() {
  const tokens = useInferenceStore((s) => s.tokens);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (tokens.length === 0) return;

    const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.3,
      roughness: 0.4,
    });

    const mesh = new THREE.InstancedMesh(geometry, material, tokens.length);
    const matrix = new THREE.Matrix4();

    tokens.forEach((_, i) => {
      matrix.setPosition(i * TOKEN_SPACING - (tokens.length * TOKEN_SPACING) / 2, EMBEDDING_Y, 0);
      mesh.setMatrixAt(i, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    meshRef.current = mesh;
    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [tokens, scene]);

  return null;
}
