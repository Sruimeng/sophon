import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TokenJourney } from './TokenJourney';
import { ProbabilityRing } from './ProbabilityRing';
import { useInferenceStore } from '~/store/inference';
import { LAYER_COUNT } from '~/constants/inference';
import * as THREE from 'three';

export function Scene() {
  const candidates = useInferenceStore((s) => s.candidates);
  const currentLayer = useInferenceStore((s) => s.currentLayer);

  const LAYER_HEIGHT = 3;
  const LAYER_GAP = 0.5;
  const LM_HEAD_LAYER = LAYER_COUNT - 1;
  const ringY = 2 - LM_HEAD_LAYER * (LAYER_HEIGHT + LAYER_GAP);
  const showRing = currentLayer >= LM_HEAD_LAYER && candidates.length > 0;
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

      <TokenJourney />
      {showRing && (
        <ProbabilityRing
          candidates={candidates}
          selectedTokenId={null}
          position={new THREE.Vector3(0, ringY, 0)}
        />
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
