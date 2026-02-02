import * as webllm from '@mlc-ai/web-llm';
import type { ModelConfig } from '~/types/inference';

let engineInstance: webllm.MLCEngine | null = null;

export async function initEngine(config: ModelConfig): Promise<webllm.MLCEngine> {
  if (engineInstance) return engineInstance;

  const engine = new webllm.MLCEngine();

  engine.setInitProgressCallback((progress) => {
    config.progressCallback(Math.round(progress.progress * 100));
  });

  await engine.reload(config.modelId);

  engineInstance = engine;
  return engine;
}

export function getEngine(): webllm.MLCEngine | null {
  return engineInstance;
}

export function isEngineLoaded(): boolean {
  return engineInstance !== null;
}

export async function disposeEngine(): Promise<void> {
  if (!engineInstance) return;
  try {
    await engineInstance.unload();
  } catch (e) {
    console.warn('[engine] Unload failed:', e);
  }
  engineInstance = null;
}
