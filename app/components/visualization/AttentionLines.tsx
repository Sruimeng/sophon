import { useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useInferenceStore } from '~/store/inference';
import { TOKEN_SPACING } from '~/constants/inference';
import { useArcPool } from './ArcPool';
import { computeArcGeometry, MIN_WEIGHT_THRESHOLD } from '~/lib/three/arc-math';

const LAYER_HEIGHT = 3;
const LAYER_GAP = 0.5;
const MAX_LINES = 50;

// Color pool - pre-allocated to avoid allocations in render
const COLOR_PALETTE = Array.from({ length: 20 }, (_, i) => {
  const hue = 0.55;
  const lightness = 0.4 + (i / 20) * 0.3;
  return new THREE.Color().setHSL(hue, 0.8, lightness);
});

interface AttentionLinesProps {
  phase: 'moving' | 'attention' | 'ffn';
}

export function AttentionLines({ phase }: AttentionLinesProps) {
  const weights = useInferenceStore((s) => s.attentionWeights);
  const currentLayer = useInferenceStore((s) => s.currentLayer);
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);

  const pool = useArcPool();
  const tokenCount = Math.min(tokens.length + generatedTokens.length, 30);

  const filtered = useMemo(() => {
    if (tokenCount === 0 || currentLayer < 1) return [];

    return weights
      .filter((w) => w.layer === currentLayer && w.weight > MIN_WEIGHT_THRESHOLD)
      .slice(0, MAX_LINES);
  }, [weights, currentLayer, tokenCount]);

  const positions = useMemo(() => {
    if (tokenCount === 0) return [];

    const totalWidth = tokenCount * TOKEN_SPACING;
    const startX = -totalWidth / 2;
    const layerY = 2 - currentLayer * (LAYER_HEIGHT + LAYER_GAP);

    return Array.from({ length: tokenCount }, (_, i) => {
      const x = startX + i * TOKEN_SPACING;
      return new THREE.Vector3(x, layerY, 0);
    });
  }, [tokenCount, currentLayer]);

  useEffect(() => {
    if (phase !== 'attention') {
      pool.clear();
      return;
    }

    if (positions.length === 0) return;

    const indices: number[] = [];
    filtered.forEach((attention) => {
      const geometry = computeArcGeometry(attention, positions);
      const idx = pool.allocate(geometry);
      if (idx !== null) indices.push(idx);
    });

    return () => {
      indices.forEach(pool.release);
    };
  }, [filtered, phase, positions, pool]);

  useFrame((_, delta) => {
    if (phase !== 'attention') return;

    pool.refs.forEach((arc, i) => {
      if (!pool.active.has(i)) return;
      arc.opacity = Math.min(arc.opacity + delta * 2, 1);
    });
  });

  if (phase !== 'attention') return null;

  return (
    <group>
      {pool.refs.map((arc, i) => {
        if (!pool.active.has(i) || !arc.geometry) return null;

        const { start, control, end, weight } = arc.geometry;
        const weightIndex = Math.floor(weight * 20);
        const color = COLOR_PALETTE[Math.max(0, Math.min(19, weightIndex))];

        return (
          <QuadraticBezierLine
            key={i}
            start={start}
            mid={control}
            end={end}
            color={color}
            lineWidth={2}
            transparent
            opacity={arc.opacity * 0.6}
          />
        );
      })}
    </group>
  );
}
