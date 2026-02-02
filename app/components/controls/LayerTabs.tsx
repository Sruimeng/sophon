import { useMemo } from 'react';
import { useInferenceStore } from '~/store/inference';
import { LAYER_COUNT } from '~/constants/inference';

export function LayerTabs() {
  const currentLayer = useInferenceStore((s) => s.currentLayer);
  const setCurrentLayer = useInferenceStore((s) => s.setCurrentLayer);

  const tabs = useMemo(
    () => [
      { label: 'Embedding', value: 0 },
      ...Array.from({ length: LAYER_COUNT - 1 }, (_, i) => ({
        label: `Block ${i + 1}`,
        value: i + 1,
      })),
    ],
    []
  );

  return (
    <div className="p-4 bg-slate-900/70 backdrop-blur-md rounded-lg border border-white/10">
      <h3 className="text-sm font-medium text-slate-100 mb-3">Transformer Layer</h3>
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const activeClass =
            currentLayer === tab.value
              ? 'bg-blue-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700';

          return (
            <button
              key={tab.value}
              onClick={() => setCurrentLayer(tab.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeClass}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
