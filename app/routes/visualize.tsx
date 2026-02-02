import { useEffect } from 'react';
import { WebGPUGuard } from '~/components/shared/WebGPUGuard';
import { Scene } from '~/components/visualization/Scene';
import { LayerTabs } from '~/components/controls/LayerTabs';
import { SamplingSlider } from '~/components/controls/SamplingSlider';
import { ProbabilityProgress } from '~/components/controls/ProbabilityProgress';
import { useInferenceStore } from '~/store/inference';
import { generateAllLayersAttention } from '~/lib/webllm/inference';

export default function Visualize() {
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const generatedText = useInferenceStore((s) => s.generatedText);
  const candidates = useInferenceStore((s) => s.candidates);
  const metrics = useInferenceStore((s) => s.metrics);
  const addAttentionWeights = useInferenceStore((s) => s.addAttentionWeights);

  const allTokens = [...tokens, ...generatedTokens];

  useEffect(() => {
    if (allTokens.length === 0) return;

    console.log('[Visualize] Generating attention for', allTokens.length, 'tokens');
    const weights = generateAllLayersAttention(allTokens.length);
    addAttentionWeights(weights);
  }, [allTokens.length, addAttentionWeights]);

  // Candidates are now set by real logprobs from generate()

  return (
    <WebGPUGuard>
      <div className="relative h-screen w-screen bg-obsidian-100">
        <Scene />
      </div>
    </WebGPUGuard>
  );
}
