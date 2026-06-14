import type { Match } from "@/types/match";
import type { TotalGoalsSelection } from "@/types/bet";
import type { ScoreLine, ScorePrediction } from "@/types/score";
import { clamp } from "./utils";

function factorial(value: number): number {
  if (value <= 1) {
    return 1;
  }

  return value * factorial(value - 1);
}

function poissonProbability(lambda: number, goals: number) {
  return (Math.E ** -lambda * lambda ** goals) / factorial(goals);
}

function calculateNormalizedScores(match: Match) {
  const expectedGoals = calculateExpectedGoals(match);
  const scores: ScoreLine[] = [];

  for (let homeGoals = 0; homeGoals <= 5; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= 5; awayGoals += 1) {
      scores.push({
        homeGoals,
        awayGoals,
        probability:
          poissonProbability(expectedGoals.home, homeGoals) *
          poissonProbability(expectedGoals.away, awayGoals),
      });
    }
  }

  const totalProbability = scores.reduce(
    (sum, score) => sum + score.probability,
    0,
  );

  return scores.map((score) => ({
    ...score,
    probability: score.probability / totalProbability,
  }));
}

function getNormalizedScores(match: Match) {
  return calculateNormalizedScores(match);
}

export function calculateExpectedGoals(match: Match) {
  const eloDiff = match.homeElo - match.awayElo;
  const homeBase = 1.35;
  const awayBase = 1.1;
  const eloAdjustment = clamp(-0.65, 0.65, eloDiff / 500);

  return {
    home: clamp(0.35, 3.2, homeBase + eloAdjustment),
    away: clamp(0.25, 2.9, awayBase - eloAdjustment * 0.85),
  };
}

export function calculateScorePrediction(match: Match): ScorePrediction {
  const expectedGoals = calculateExpectedGoals(match);
  const normalizedScores = calculateNormalizedScores(match);

  const topScores = [...normalizedScores]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  const goalMargins = normalizedScores.reduce(
    (result, score) => {
      const margin = score.homeGoals - score.awayGoals;

      if (margin === 1) {
        result.homeByOne += score.probability;
      } else if (margin >= 2) {
        result.homeByTwoPlus += score.probability;
      } else if (margin === 0) {
        result.draw += score.probability;
      } else if (margin === -1) {
        result.awayByOne += score.probability;
      } else {
        result.awayByTwoPlus += score.probability;
      }

      return result;
    },
    {
      homeByOne: 0,
      homeByTwoPlus: 0,
      draw: 0,
      awayByOne: 0,
      awayByTwoPlus: 0,
    },
  );

  const totals = normalizedScores.reduce(
    (result, score) => {
      if (score.homeGoals + score.awayGoals > 2.5) {
        result.over25 += score.probability;
      } else {
        result.under25 += score.probability;
      }

      return result;
    },
    {
      over25: 0,
      under25: 0,
    },
  );

  return {
    expectedGoals,
    topScores,
    goalMargins,
    totals,
  };
}

export function calculateExactScoreProbability(
  match: Match,
  homeGoals: number,
  awayGoals: number,
) {
  const score = calculateNormalizedScores(match).find(
    (item) => item.homeGoals === homeGoals && item.awayGoals === awayGoals,
  );

  return score?.probability ?? 0;
}

export function calculateTotalGoalsProbability(
  match: Match,
  direction: "over" | "under",
  point: number,
) {
  return getNormalizedScores(match).reduce((sum, score) => {
    const total = score.homeGoals + score.awayGoals;
    const isHit = direction === "over" ? total > point : total < point;
    return isHit ? sum + score.probability : sum;
  }, 0);
}

export function calculateTotalGoalsBucketProbability(
  match: Match,
  selection: TotalGoalsSelection,
) {
  return getNormalizedScores(match).reduce((sum, score) => {
    const total = score.homeGoals + score.awayGoals;
    const isHit =
      selection === "7plus" ? total >= 7 : total === Number(selection);

    return isHit ? sum + score.probability : sum;
  }, 0);
}

export function calculateSpreadCoverProbability(
  match: Match,
  team: "home" | "away",
  point: number,
) {
  return getNormalizedScores(match).reduce((sum, score) => {
    const homeSpreadResult = score.homeGoals - score.awayGoals + point;
    const awaySpreadResult = score.awayGoals - score.homeGoals + point;
    const isHit = team === "home" ? homeSpreadResult > 0 : awaySpreadResult > 0;
    return isHit ? sum + score.probability : sum;
  }, 0);
}
