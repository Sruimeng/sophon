import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TokenLayer } from './TokenLayer';
import { AttentionLines } from './AttentionLines';
import { Camera } from './Camera';

export function Scene() {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ position: [0, 5, 10], fov: 45 }}
      className="h-screen w-screen"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Camera />
      <TokenLayer />
      <AttentionLines />
      <OrbitControls />

      <gridHelper args={[20, 20]} />
    </Canvas>
  );
}
