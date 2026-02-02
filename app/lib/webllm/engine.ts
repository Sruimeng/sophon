import * as webllm from '@mlc-ai/web-llm';
import type { ModelConfig } from '~/types/inference';

let engineInstance: webllm.MLCEngine | null = null;

export async function initEngine(config: ModelConfig): Promise<webllm.MLCEngine> {
  if (engineInstance) {
    return engineInstance;
  }

  const engine = new webllm.MLCEngine();

  await engine.reload(config.modelId, {
    temperature: 0.7,
    top_p: 0.9,
  });

  engineInstance = engine;
  return engine;
}

export function getEngine(): webllm.MLCEngine | null {
  return engineInstance;
}

export async function disposeEngine(): Promise<void> {
  if (!engineInstance) return;

  engineInstance = null;
}
