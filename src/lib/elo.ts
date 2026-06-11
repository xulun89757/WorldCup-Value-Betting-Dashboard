import type { Selection } from "@/types/match";
import { clamp } from "./utils";

export function calculateExpectedScore(teamElo: number, opponentElo: number) {
  return 1 / (1 + 10 ** ((opponentElo - teamElo) / 400));
}

export function calculateMatchProbabilities(
  homeElo: number,
  awayElo: number,
): Record<Selection, number> {
  const homeExpected = calculateExpectedScore(homeElo, awayElo);
  const eloDiff = Math.abs(homeElo - awayElo);
  const draw = clamp(0.18, 0.3, 0.28 - eloDiff / 2000);
  const remaining = 1 - draw;

  return {
    home: remaining * homeExpected,
    draw,
    away: remaining * (1 - homeExpected),
  };
}
