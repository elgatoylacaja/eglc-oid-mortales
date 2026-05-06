export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function nodeRadius(followers: number): number {
  return Math.min(20, Math.max(2, Math.log10(followers + 1) * 2.5));
}
