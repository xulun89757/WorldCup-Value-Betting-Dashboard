import type { Selection } from "@/types/match";

export function calculateImpliedProbability(odds: number) {
  if (odds <= 1) {
    throw new Error("Odds must be greater than 1.");
  }

  return 1 / odds;
}

export function normalizeProbabilities(
  rawProbabilities: Record<Selection, number>,
): Record<Selection, number> {
  const total =
    rawProbabilities.home + rawProbabilities.draw + rawProbabilities.away;

  if (total <= 0) {
    throw new Error("Probability total must be greater than 0.");
  }

  return {
    home: rawProbabilities.home / total,
    draw: rawProbabilities.draw / total,
    away: rawProbabilities.away / total,
  };
}

export function calculateMarketProbabilities(odds: Record<Selection, number>) {
  return normalizeProbabilities({
    home: calculateImpliedProbability(odds.home),
    draw: calculateImpliedProbability(odds.draw),
    away: calculateImpliedProbability(odds.away),
  });
}
