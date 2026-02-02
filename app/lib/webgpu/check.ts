export function checkWebGPU(): boolean {
  return 'gpu' in navigator;
}
