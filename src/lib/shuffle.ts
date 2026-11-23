/** Embaralhamento de Fisher–Yates: todas as ordens têm a mesma probabilidade. */
export function shuffle<T>(itens: readonly T[], aleatorio: () => number = Math.random): T[] {
  const a = [...itens];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
