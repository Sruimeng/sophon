import type React from 'react';
import { useEffect, useState } from 'react';

export const Canonical: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />;
};
