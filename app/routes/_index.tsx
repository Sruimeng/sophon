import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WebGPUGuard } from '~/components/shared/WebGPUGuard';
import { RightPanelDrawer } from '~/components/shared/RightPanelDrawer';
import { Scene } from '~/components/visualization/Scene';
import { LayerTabs } from '~/components/controls/LayerTabs';
import { SamplingSlider } from '~/components/controls/SamplingSlider';
import { ProbabilityProgress } from '~/components/controls/ProbabilityProgress';
import { PromptForm } from '~/components/input/PromptForm';
import { useInferenceStore } from '~/store/inference';
import { generateAllLayersAttention } from '~/lib/webllm/inference';

export default function Index() {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const status = useInferenceStore((s) => s.status);
  const tokens = useInferenceStore((s) => s.tokens);
  const generatedTokens = useInferenceStore((s) => s.generatedTokens);
  const generatedText = useInferenceStore((s) => s.generatedText);
  const candidates = useInferenceStore((s) => s.candidates);
  const metrics = useInferenceStore((s) => s.metrics);
  const addAttentionWeights = useInferenceStore((s) => s.addAttentionWeights);

  const allTokens = [...tokens, ...generatedTokens];
  const hasResults = status === 'complete' || allTokens.length > 0;

  useEffect(() => {
    if (allTokens.length === 0) return;
    const weights = generateAllLayersAttention(allTokens.length);
    addAttentionWeights(weights);
  }, [allTokens.length, addAttentionWeights]);

  // Landing state: centered prompt with grid background
  if (!hasResults) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] transition-colors duration-300">
        {/* Grid background */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 radial-glow" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-[var(--color-text)]">{t('inference.title')}</h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              {t('inference.subtitle')}
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <div className="glass-card p-4 shadow-2xl">
              <PromptForm />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Visualization state: 3D scene + overlay panels + bottom input
  return (
    <WebGPUGuard>
      <div className="relative h-screen w-screen bg-[var(--color-bg)]">
        {/* Grid background behind 3D */}
        <div className="absolute inset-0 grid-pattern pointer-events-none" />

        <Scene />

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed top-4 right-4 z-20 lg:hidden rounded-lg bg-[var(--color-accent)] px-4 py-2 text-white font-medium shadow-lg hover:shadow-xl transition-all"
        >
          ☰
        </button>

        <RightPanelDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          <div className="glass-card p-3 text-sm space-y-2 shadow-xl">
            <div className="font-medium text-[var(--color-accent)]">{t('inference.tokens.input')} ({tokens.length})</div>
            <div className="flex flex-wrap gap-1">
              {tokens.map((t) => (
                <span key={`in-${t.position}`} className="rounded-md bg-[var(--color-accent)]/20 px-1.5 py-0.5 text-xs text-[var(--color-accent)]">
                  {t.text}
                </span>
              ))}
            </div>

            {generatedTokens.length > 0 && (
              <>
                <div className="font-medium text-green-400 mt-2">{t('inference.tokens.generated')} ({generatedTokens.length})</div>
                <div className="flex flex-wrap gap-1">
                  {generatedTokens.map((t) => (
                    <span key={`gen-${t.position}`} className="rounded-md bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
                      {t.text}
                    </span>
                  ))}
                </div>
              </>
            )}

            {generatedText && (
              <div className="mt-2 p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">{t('inference.tokens.output')}:</div>
                <div className="text-[var(--color-text)] text-xs">{generatedText}</div>
              </div>
            )}

            {candidates.length > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">{t('inference.probability.title')}:</div>
                {candidates.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex justify-between text-xs mt-0.5">
                    <span className="text-[var(--color-text)] font-mono">{JSON.stringify(c.token)}</span>
                    <span className="text-green-400">{(c.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}

            {metrics && (
              <div className="mt-2 p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">{t('inference.metrics.title')}:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)]">{t('inference.metrics.in')}:</span>
                    <span className="text-[var(--color-text)] ml-1">{metrics.promptTokens}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">{t('inference.metrics.out')}:</span>
                    <span className="text-[var(--color-text)] ml-1">{metrics.completionTokens}</span>
                  </div>
                  {metrics.tokensPerSecond && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">{t('inference.metrics.speed')}:</span>
                      <span className="text-cyan-400 ml-1">{metrics.tokensPerSecond.toFixed(1)} {t('inference.metrics.tokensPerSecond')}</span>
                    </div>
                  )}
                  {metrics.decodeTime && (
                    <div>
                      <span className="text-[var(--color-text-muted)]">{t('inference.metrics.time')}:</span>
                      <span className="text-[var(--color-text)] ml-1">{(metrics.decodeTime / 1000).toFixed(2)}s</span>
                    </div>
                  )}
                  {metrics.gpuVendor && (
                    <div className="col-span-2">
                      <span className="text-[var(--color-text-muted)]">{t('inference.metrics.gpu')}:</span>
                      <span className="text-amber-400 ml-1">{metrics.gpuVendor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <LayerTabs />
          <SamplingSlider />
          <ProbabilityProgress />
        </RightPanelDrawer>

        {/* Bottom input bar */}
        <div className="absolute bottom-0 left-0 right-0 lg:right-96 p-4 bg-gradient-to-t from-[var(--color-bg)] to-transparent z-10">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-3 shadow-xl">
              <PromptForm />
            </div>
          </div>
        </div>
      </div>
    </WebGPUGuard>
  );
}
