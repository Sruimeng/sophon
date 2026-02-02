import { useTranslation } from 'react-i18next';
import { useInferenceStore } from '~/store/inference';

export function ProbabilityProgress() {
  const { t } = useTranslation();
  const candidates = useInferenceStore((s) => s.candidates);

  if (candidates.length === 0) return null;

  return (
    <div className="glass-card p-3 shadow-xl space-y-2">
      <h3 className="text-xs font-medium text-[var(--color-text-muted)] mb-2">{t('inference.probability.title')}</h3>
      {candidates.map((c, index) => (
        <div key={`${c.tokenId}-${index}`}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono text-[var(--color-text)]">{c.token}</span>
            <span className="text-[var(--color-accent)]">{(c.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#f87171] to-[#fb923c] h-full transition-all duration-300"
              style={{ width: `${c.probability * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
