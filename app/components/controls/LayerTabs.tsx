import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInferenceStore } from '~/store/inference';
import { LAYER_COUNT } from '~/constants/inference';

export function LayerTabs() {
  const { t } = useTranslation();
  const currentLayer = useInferenceStore((s) => s.currentLayer);
  const setCurrentLayer = useInferenceStore((s) => s.setCurrentLayer);

  const tabs = useMemo(
    () => [
      { label: t('inference.layers.embedding'), value: 0 },
      ...Array.from({ length: LAYER_COUNT - 1 }, (_, i) => ({
        label: `${t('inference.layers.block')} ${i + 1}`,
        value: i + 1,
      })),
    ],
    [t]
  );

  return (
    <div className="glass-card p-3 shadow-xl">
      <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">{t('inference.layers.title')}</h3>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = currentLayer === tab.value;
          const activeClass = isActive
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]';

          return (
            <button
              key={tab.value}
              onClick={() => setCurrentLayer(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-[var(--color-border-subtle)] ${activeClass}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
