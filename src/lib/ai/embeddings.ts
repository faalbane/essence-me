// Simple embedding using a hash-based approach for MVP
// For production, replace with a proper embedding API (OpenAI, Cohere, etc.)

export function generateEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const dim = 128;
  const embedding = new Array(dim).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const idx = (word.charCodeAt(j) * 31 + j * 17 + i * 7) % dim;
      embedding[idx] += 1 / words.length;
    }
  }

  // Normalize
  const magnitude = Math.sqrt(
    embedding.reduce((sum: number, val: number) => sum + val * val, 0)
  );
  if (magnitude > 0) {
    for (let i = 0; i < dim; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
