import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import {
  ATTENTION_THRESHOLD,
  MAX_LINE_WIDTH,
  TOKEN_SPACING,
  EMBEDDING_Y,
} from '~/constants/inference';

export function AttentionLines() {
  const weights = useInferenceStore((s) => s.attentionWeights);
  const currentLayer = useInferenceStore((s) => s.currentLayer);
  const tokens = useInferenceStore((s) => s.tokens);

  const filteredWeights = useMemo(
    () => weights.filter((w) => w.layer === currentLayer && w.weight > ATTENTION_THRESHOLD),
    [weights, currentLayer]
  );

  const lines = useMemo(() => {
    if (tokens.length === 0) return [];

    return filteredWeights.map((w) => {
      const queryX = w.query * TOKEN_SPACING - (tokens.length * TOKEN_SPACING) / 2;
      const keyX = w.key * TOKEN_SPACING - (tokens.length * TOKEN_SPACING) / 2;

      const points = [
        new THREE.Vector3(queryX, EMBEDDING_Y, 0),
        new THREE.Vector3(keyX, EMBEDDING_Y, 0),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        opacity: w.weight,
        transparent: true,
        linewidth: w.weight * MAX_LINE_WIDTH,
      });
      const line = new THREE.Line(geometry, material);

      return { line, geometry, material, weight: w };
    });
  }, [filteredWeights, tokens]);

  useEffect(() => {
    return () => {
      lines.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    };
  }, [lines]);

  return (
    <group>
      {lines.map(({ line, weight }) => (
        <primitive
          key={`${weight.layer}-${weight.query}-${weight.key}`}
          object={line}
        />
      ))}
    </group>
  );
}
