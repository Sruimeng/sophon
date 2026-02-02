import { useInferenceStore } from '~/store/inference';

export function ProbabilityProgress() {
  const candidates = useInferenceStore((s) => s.candidates);

  if (candidates.length === 0) return null;

  return (
    <div className="p-4 bg-slate-900/70 backdrop-blur-md rounded-lg border border-white/10 space-y-3">
      <h3 className="text-sm font-medium text-slate-100 mb-2">Top Candidates</h3>
      {candidates.map((c) => (
        <div key={c.tokenId}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-mono text-slate-300">{c.token}</span>
            <span className="text-slate-400">{(c.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${c.probability * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
