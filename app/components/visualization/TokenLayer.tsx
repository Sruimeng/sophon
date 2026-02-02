import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import { TOKEN_SPACING, EMBEDDING_Y, MAX_TOKENS } from '~/constants/inference';

const hiddenMatrix = new THREE.Matrix4().setPosition(0, -1000, 0);

export function TokenLayer() {
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const genMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const { scene } = useThree();

  const allTokens = [...tokens, ...generatedTokens];

  // Init meshes once
  useEffect(() => {
    const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);

    const blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.3,
      roughness: 0.4,
    });

    const greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      metalness: 0.3,
      roughness: 0.4,
    });

    const inputMesh = new THREE.InstancedMesh(geometry, blueMaterial, MAX_TOKENS);
    const genMesh = new THREE.InstancedMesh(geometry, greenMaterial, MAX_TOKENS);

    // Hide all instances initially
    for (let i = 0; i < MAX_TOKENS; i++) {
      inputMesh.setMatrixAt(i, hiddenMatrix);
      genMesh.setMatrixAt(i, hiddenMatrix);
    }

    inputMesh.instanceMatrix.needsUpdate = true;
    genMesh.instanceMatrix.needsUpdate = true;

    meshRef.current = inputMesh;
    genMeshRef.current = genMesh;
    scene.add(inputMesh, genMesh);

    return () => {
      scene.remove(inputMesh, genMesh);
      geometry.dispose();
      blueMaterial.dispose();
      greenMaterial.dispose();
    };
  }, [scene]);

  // Update matrices on token change
  useEffect(() => {
    if (!meshRef.current || !genMeshRef.current) return;

    const totalWidth = allTokens.length * TOKEN_SPACING;
    const offset = totalWidth / 2;
    const matrix = new THREE.Matrix4();

    // Update input tokens
    tokens.forEach((_, i) => {
      matrix.setPosition(i * TOKEN_SPACING - offset, EMBEDDING_Y, 0);
      meshRef.current!.setMatrixAt(i, matrix);
    });

    // Hide unused input slots
    for (let i = tokens.length; i < MAX_TOKENS; i++) {
      meshRef.current.setMatrixAt(i, hiddenMatrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Update generated tokens
    generatedTokens.forEach((_, i) => {
      const position = tokens.length + i;
      matrix.setPosition(position * TOKEN_SPACING - offset, EMBEDDING_Y, 0);
      genMeshRef.current!.setMatrixAt(i, matrix);
    });

    // Hide unused gen slots
    for (let i = generatedTokens.length; i < MAX_TOKENS; i++) {
      genMeshRef.current.setMatrixAt(i, hiddenMatrix);
    }

    genMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [tokens, generatedTokens, allTokens.length]);

  return null;
}
