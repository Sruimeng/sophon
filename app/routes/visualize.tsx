import { useEffect } from 'react';
import { WebGPUGuard } from '~/components/shared/WebGPUGuard';
import { Scene } from '~/components/visualization/Scene';
import { LayerTabs } from '~/components/controls/LayerTabs';
import { SamplingSlider } from '~/components/controls/SamplingSlider';
import { ProbabilityProgress } from '~/components/controls/ProbabilityProgress';
import { useInferenceStore } from '~/store/inference';
import { generateAllLayersAttention } from '~/lib/webllm/inference';
import { generateMockCandidates } from '~/lib/webllm/sampling';

export default function Visualize() {
  const tokens = useInferenceStore((s) => s.tokens);
  const temperature = useInferenceStore((s) => s.temperature);
  const topP = useInferenceStore((s) => s.topP);
  const addAttentionWeights = useInferenceStore((s) => s.addAttentionWeights);
  const setCandidates = useInferenceStore((s) => s.setCandidates);

  useEffect(() => {
    if (tokens.length === 0) return;

    const weights = generateAllLayersAttention(tokens.length);
    addAttentionWeights(weights);
  }, [tokens.length, addAttentionWeights]);

  useEffect(() => {
    const candidates = generateMockCandidates(temperature);
    setCandidates(candidates);
  }, [temperature, topP, setCandidates]);

  return (
    <WebGPUGuard>
      <div className="relative h-screen w-screen bg-obsidian-100">
        <Scene />

        <div className="absolute top-4 right-4 flex flex-col gap-4 max-w-md">
          <LayerTabs />
          <SamplingSlider />
          <ProbabilityProgress />
        </div>
      </div>
    </WebGPUGuard>
  );
}
