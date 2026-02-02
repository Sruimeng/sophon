import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { checkWebGPU } from '~/lib/webgpu/check';
import { tokenize } from '~/lib/webllm/tokenizer';
import { useInferenceStore } from '~/store/inference';

const MODELS = [
  { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', name: 'Llama 3 8B' },
  { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi 3 Mini' },
];

export function PromptForm() {
  const navigate = useNavigate();
  const setTokens = useInferenceStore((s) => s.setTokens);
  const setStatus = useInferenceStore((s) => s.setStatus);

  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!prompt.trim()) {
        setError('Prompt required');
        return;
      }

      if (!checkWebGPU()) {
        setError('WebGPU not supported');
        return;
      }

      setLoading(true);
      setError('');
      setStatus('tokenizing');

      try {
        const tokens = await tokenize(prompt);

        setTokens(tokens);
        setStatus('complete');
        navigate('/visualize');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tokenization failed');
        setStatus('idle');
      } finally {
        setLoading(false);
      }
    },
    [prompt, navigate, setTokens, setStatus]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <div>
        <label htmlFor="prompt" className="mb-2 block text-sm font-medium">
          Input Text
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter text to tokenize..."
          rows={4}
          className="w-full rounded-lg border border-border-subtle bg-surface-secondary px-4 py-2 text-text-primary focus:border-core-blue focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="model" className="mb-2 block text-sm font-medium">
          Model
        </label>
        <select
          id="model"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-surface-secondary px-4 py-2 text-text-primary focus:border-core-blue focus:outline-none"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-status-error/10 px-4 py-2 text-sm text-status-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-core-blue px-6 py-3 text-white transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Tokenize & Visualize'}
      </button>
    </form>
  );
}
