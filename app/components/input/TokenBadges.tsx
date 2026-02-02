import type { Token } from '~/types/inference';
import { useInferenceStore } from '~/store/inference';

export function TokenBadges() {
  const tokens = useInferenceStore((s) => s.tokens);

  if (tokens.length === 0) return null;

  return (
    <div className="w-full max-w-2xl">
      <h3 className="mb-4 text-lg font-semibold">Tokens ({tokens.length})</h3>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token: Token, i: number) => (
          <div
            key={i}
            className="rounded-md bg-core-blue/20 px-3 py-1 text-sm text-core-blue"
          >
            {token.text}
          </div>
        ))}
      </div>
    </div>
  );
}
