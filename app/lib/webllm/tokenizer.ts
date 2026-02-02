import type { Token } from '~/types/inference';

export async function tokenize(text: string): Promise<Token[]> {
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  return words.map((word, position) => ({
    id: hashString(word),
    text: word,
    position,
  }));
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
