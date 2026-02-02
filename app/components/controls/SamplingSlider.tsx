import { useInferenceStore } from '~/store/inference';

export function SamplingSlider() {
  const temperature = useInferenceStore((s) => s.temperature);
  const topP = useInferenceStore((s) => s.topP);
  const setTemperature = useInferenceStore((s) => s.setTemperature);
  const setTopP = useInferenceStore((s) => s.setTopP);

  return (
    <div className="p-4 bg-slate-900/70 backdrop-blur-md rounded-lg border border-white/10 space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-100 mb-2 block">
          Temperature: {temperature.toFixed(2)}
        </label>
        <input
          type="range"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          min={0}
          max={2}
          step={0.1}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-100 mb-2 block">
          Top-P: {topP.toFixed(2)}
        </label>
        <input
          type="range"
          value={topP}
          onChange={(e) => setTopP(Number(e.target.value))}
          min={0}
          max={1}
          step={0.05}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}
