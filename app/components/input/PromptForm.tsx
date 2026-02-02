import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@sruim/nexus-design';
import { GradientSlider } from '~/components/ui/GradientSlider';
import { checkWebGPU } from '~/lib/webgpu/check';
import { initEngine, isEngineLoaded } from '~/lib/webllm/engine';
import { tokenize } from '~/lib/webllm/tokenizer';
import { generate } from '~/lib/webllm/generate';
import { useInferenceStore } from '~/store/inference';

const MODELS = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 1B (Lite)' },
  { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', name: 'Llama 3 8B' },
  { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi 3 Mini' },
];

type Phase = 'idle' | 'loading-model' | 'tokenizing' | 'inferring';

export function PromptForm() {
  const { t } = useTranslation();
  const setTokens = useInferenceStore((s) => s.setTokens);
  const setStatus = useInferenceStore((s) => s.setStatus);
  const setGeneratedText = useInferenceStore((s) => s.setGeneratedText);
  const addGeneratedToken = useInferenceStore((s) => s.addGeneratedToken);
  const setCandidates = useInferenceStore((s) => s.setCandidates);
  const setMetrics = useInferenceStore((s) => s.setMetrics);
  const reset = useInferenceStore((s) => s.reset);
  const temperature = useInferenceStore((s) => s.temperature);
  const topP = useInferenceStore((s) => s.topP);
  const tokenDelay = useInferenceStore((s) => s.tokenDelay);
  const setTokenDelay = useInferenceStore((s) => s.setTokenDelay);

  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!prompt.trim()) {
        setError(t('inference.promptRequired'));
        return;
      }

      if (!checkWebGPU()) {
        setError(t('inference.webgpuNotSupported'));
        return;
      }

      setError('');
      reset();

      try {
        // Phase 1: Load model (keep engine alive for continuous dialog)
        if (!isEngineLoaded()) {
          setPhase('loading-model');
          setProgress(0);
          setStatus('embedding');

          await initEngine({
            modelId,
            device: 'webgpu',
            progressCallback: setProgress,
          });
        }

        // Phase 2: Tokenize
        setPhase('tokenizing');
        setStatus('tokenizing');

        const tokens = await tokenize(prompt);
        setTokens(tokens);

        // Phase 3: Inference (engine stays alive)
        setPhase('inferring');
        setStatus('inferring');

        let tokenIndex = tokens.length;
        const result = await generate({
          prompt,
          temperature,
          topP,
          maxTokens: 1024,
          tokenDelay,
          onToken: (tokenText, tokenId, candidates) => {
            addGeneratedToken({
              id: tokenId,
              text: tokenText,
              position: tokenIndex++,
            });
            if (candidates.length > 0) {
              setCandidates(candidates);
            }
          },
        });

        setGeneratedText(result.text);
        setMetrics(result.metrics);
        setStatus('complete');
        setPrompt('');
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('inference.failed');
        setError(msg);
        setStatus('idle');
      } finally {
        setPhase('idle');
      }
    },
    [prompt, modelId, setTokens, setStatus, setGeneratedText, addGeneratedToken, setCandidates, setMetrics, reset, temperature, topP, tokenDelay, t]
  );

  const isLoading = phase !== 'idle';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          disabled={isLoading}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 transition-colors"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-300 whitespace-nowrap font-medium">
          {t('inference.speed', { defaultValue: '显示速度' })}
        </label>
        <GradientSlider
          value={[tokenDelay]}
          onValueChange={(val) => setTokenDelay(val[0])}
          min={0}
          max={2000}
          step={100}
          showValue
          valueLabel="ms"
          disabled={isLoading}
          className="flex-1"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('inference.placeholder', { defaultValue: '输入提示词...' })}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={isLoading}
          variant="solid"
          size="large"
          className="bg-gradient-to-r from-[#f87171] to-[#fb923c] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:shadow-xl whitespace-nowrap"
        >
          {phase === 'loading-model'
            ? `${progress}%`
            : phase === 'tokenizing'
              ? t('inference.tokenizing', { defaultValue: '分词中...' })
              : phase === 'inferring'
                ? t('inference.generating', { defaultValue: '生成中...' })
                : t('inference.send', { defaultValue: '发送' })}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {phase === 'loading-model' && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f87171] to-[#fb923c] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </form>
  );
}
