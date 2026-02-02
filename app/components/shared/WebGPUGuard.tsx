import { useEffect, useState } from 'react';
import { checkWebGPU } from '~/lib/webgpu/check';

interface WebGPUGuardProps {
  children: React.ReactNode;
}

export function WebGPUGuard({ children }: WebGPUGuardProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(checkWebGPU());
  }, []);

  if (isSupported === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Checking WebGPU support...</div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md rounded-lg border border-border-subtle bg-surface-secondary p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-text-primary">WebGPU Required</h2>
          <p className="mb-6 text-text-secondary">
            This application requires WebGPU support. Please use Chrome 113+, Edge 113+, or another
            WebGPU-enabled browser.
          </p>
          <a
            href="https://caniuse.com/webgpu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-core-blue hover:underline"
          >
            Check browser compatibility
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
