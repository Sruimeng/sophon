import { useTranslation } from 'react-i18next';
import { useInferenceStore } from '~/store/inference';

export function SamplingSlider() {
  const { t } = useTranslation();
  const temperature = useInferenceStore((s) => s.temperature);
  const topP = useInferenceStore((s) => s.topP);
  const setTemperature = useInferenceStore((s) => s.setTemperature);
  const setTopP = useInferenceStore((s) => s.setTopP);

  return (
    <div className="glass-card p-3 shadow-xl space-y-3">
      <div>
        <label className="text-xs font-medium text-[var(--color-text)] mb-2 block">
          {t('inference.sampling.temperature')}: <span className="text-[var(--color-accent)]">{temperature.toFixed(2)}</span>
        </label>
        <input
          type="range"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          min={0}
          max={2}
          step={0.1}
          className="w-full h-1.5 bg-[var(--color-bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--color-text)] mb-2 block">
          {t('inference.sampling.topP')}: <span className="text-[var(--color-accent)]">{topP.toFixed(2)}</span>
        </label>
        <input
          type="range"
          value={topP}
          onChange={(e) => setTopP(Number(e.target.value))}
          min={0}
          max={1}
          step={0.05}
          className="w-full h-1.5 bg-[var(--color-bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}
