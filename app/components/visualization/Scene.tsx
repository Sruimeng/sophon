import { useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { ProbabilityRing } from './ProbabilityRing';
import { useInferenceStore } from '~/store/inference';
import * as THREE from 'three';
import { useGeometryRegistry } from '~/lib/three/resource-manager';
import { useTorusPool } from '~/lib/three/torus-pool';

export function Scene() {
  const candidates = useInferenceStore((s) => s.candidates);
  const status = useInferenceStore((s) => s.status);
  const registry = useGeometryRegistry();
  const torusPool = useTorusPool();

  useEffect(() => {
    return () => {
      registry.disposeAll();
      torusPool.dispose();
    };
  }, [registry, torusPool]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const interval = setInterval(() => {
        console.log('[3D Resource Monitor]', {
          registry: registry.getStats(),
          torusPool: torusPool.getStats(),
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [registry, torusPool]);

  const ringY = 0;
  const showRing = status === 'inferring' && candidates.length > 0;

  const ringPosition = useMemo(() => new THREE.Vector3(0, ringY, 0), [ringY]);

  return (
    <Canvas
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{ position: [0, 0, 25], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      frameloop="demand"
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {showRing ? (
        <ProbabilityRing
          candidates={candidates}
          selectedTokenId={null}
          position={ringPosition}
        />
      ) : (
        <Html center>
          <div
            style={{
              color: '#9ca3af',
              fontSize: '18px',
              textAlign: 'center',
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '8px',
              border: '1px solid #334155',
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>🔮</div>
            <div>等待推理采样...</div>
            <div style={{ fontSize: '14px', marginTop: '8px', color: '#64748b' }}>
              候选Token将在此显示
            </div>
          </div>
        </Html>
      )}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={50}
      />
    </Canvas>
  );
}
