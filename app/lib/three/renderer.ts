import * as THREE from 'three';

export async function createRenderer(
  canvas: HTMLCanvasElement
): Promise<THREE.WebGLRenderer> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  return renderer;
}

export function createCamera(): THREE.PerspectiveCamera {
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  return camera;
}
