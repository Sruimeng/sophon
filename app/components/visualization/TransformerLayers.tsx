import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { LAYER_COUNT } from '~/constants/inference';

const LAYER_HEIGHT = 3;
const LAYER_WIDTH = 20;
const LAYER_DEPTH = 8;
const LAYER_GAP = 0.5;

interface TransformerLayerProps {
  index: number;
  isActive: boolean;
  label: string;
}

function TransformerLayer({ index, isActive, label }: TransformerLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const y = -index * (LAYER_HEIGHT + LAYER_GAP);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 0.3 : 0.1, 0.1);
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      isActive ? 0.2 : 0,
      0.1
    );
  });

  return (
    <group position={[0, y, 0]}>
      {/* Glass container */}
      <mesh ref={meshRef}>
        <boxGeometry args={[LAYER_WIDTH, LAYER_HEIGHT, LAYER_DEPTH]} />
        <meshPhysicalMaterial
          color="#3b82f6"
          transparent
          opacity={0.1}
          transmission={0.6}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#3b82f6"
          emissiveIntensity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Layer edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(LAYER_WIDTH, LAYER_HEIGHT, LAYER_DEPTH)]} />
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.5} />
      </lineSegments>

      {/* Layer label */}
      <Text
        position={[-LAYER_WIDTH / 2 - 0.5, 0, 0]}
        fontSize={0.4}
        color="#9ca3af"
        anchorX="right"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export function TransformerLayers() {
  const layers = useMemo(() => {
    const result = [];

    // Embedding layer
    result.push({ index: 0, label: 'Embedding' });

    // Transformer blocks
    for (let i = 0; i < LAYER_COUNT; i++) {
      result.push({ index: i + 1, label: `Block ${i + 1}` });
    }

    // Output layer
    result.push({ index: LAYER_COUNT + 1, label: 'LM Head' });

    return result;
  }, []);

  return (
    <group position={[0, 2, 0]}>
      {layers.map((layer, i) => (
        <TransformerLayer
          key={layer.label}
          index={i}
          isActive={i === 0} // TODO: sync with inference progress
          label={layer.label}
        />
      ))}
    </group>
  );
}

export { LAYER_HEIGHT, LAYER_GAP };
