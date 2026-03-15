export function calculateEssenceStrength(entryCount: number): number {
  if (entryCount === 0) return 0;
  if (entryCount >= 20) return 100;
  return Math.min(100, Math.round((entryCount / 20) * 100));
}
