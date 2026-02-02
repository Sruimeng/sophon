import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MAX_TOKENS } from '~/constants/inference';

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

interface SphereInstancePoolProps {
  onPoolsReady: (pools: SpherePoolRegistry) => void;
}

const hiddenMatrix = new THREE.Matrix4().setPosition(0, -1000, 0);

export function SphereInstancePool({ onPoolsReady }: SphereInstancePoolProps) {
  const { scene } = useThree();
  const poolsRef = useRef<SpherePoolRegistry | null>(null);

  useEffect(() => {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);

    // Input pool (blue)
    const inputMainMaterial = new THREE.MeshStandardMaterial({
      color: '#3b82f6',
      metalness: 0.3,
      roughness: 0.4,
      emissive: '#3b82f6',
      emissiveIntensity: 0.1,
    });

    const inputGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.3,
    });

    const inputMainMesh = new THREE.InstancedMesh(
      geometry,
      inputMainMaterial,
      MAX_TOKENS
    );
    const inputGlowMesh = new THREE.InstancedMesh(
      glowGeometry,
      inputGlowMaterial,
      MAX_TOKENS
    );

    // Generated pool (green)
    const generatedMainMaterial = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      metalness: 0.3,
      roughness: 0.4,
      emissive: '#22c55e',
      emissiveIntensity: 0.1,
    });

    const generatedGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#22c55e',
      transparent: true,
      opacity: 0.3,
    });

    const generatedMainMesh = new THREE.InstancedMesh(
      geometry,
      generatedMainMaterial,
      MAX_TOKENS
    );
    const generatedGlowMesh = new THREE.InstancedMesh(
      glowGeometry,
      generatedGlowMaterial,
      MAX_TOKENS
    );

    // Hide all instances initially
    for (let i = 0; i < MAX_TOKENS; i++) {
      inputMainMesh.setMatrixAt(i, hiddenMatrix);
      inputGlowMesh.setMatrixAt(i, hiddenMatrix);
      generatedMainMesh.setMatrixAt(i, hiddenMatrix);
      generatedGlowMesh.setMatrixAt(i, hiddenMatrix);
    }

    inputMainMesh.instanceMatrix.needsUpdate = true;
    inputGlowMesh.instanceMatrix.needsUpdate = true;
    generatedMainMesh.instanceMatrix.needsUpdate = true;
    generatedGlowMesh.instanceMatrix.needsUpdate = true;

    const pools: SpherePoolRegistry = {
      input: {
        mainMesh: inputMainMesh,
        glowMesh: inputGlowMesh,
        capacity: MAX_TOKENS,
        type: 'input',
      },
      generated: {
        mainMesh: generatedMainMesh,
        glowMesh: generatedGlowMesh,
        capacity: MAX_TOKENS,
        type: 'generated',
      },
    };

    poolsRef.current = pools;
    scene.add(inputMainMesh, inputGlowMesh, generatedMainMesh, generatedGlowMesh);
    onPoolsReady(pools);

    return () => {
      scene.remove(inputMainMesh, inputGlowMesh, generatedMainMesh, generatedGlowMesh);
      geometry.dispose();
      glowGeometry.dispose();
      inputMainMaterial.dispose();
      inputGlowMaterial.dispose();
      generatedMainMaterial.dispose();
      generatedGlowMaterial.dispose();
    };
  }, [scene, onPoolsReady]);

  return null;
}
