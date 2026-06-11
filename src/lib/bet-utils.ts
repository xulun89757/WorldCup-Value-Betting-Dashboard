import type { Bet, BetResult } from "@/types/bet";

export function calculateBetProfit({
  result,
  stake,
  odds,
}: Pick<Bet, "result" | "stake" | "odds">) {
  if (result === "win") {
    return Number((stake * (odds - 1)).toFixed(2));
  }

  if (result === "loss") {
    return -stake;
  }

  return 0;
}

export function settleBet(bet: Bet, result: Exclude<BetResult, "pending">): Bet {
  return {
    ...bet,
    status: "settled",
    result,
    profit: calculateBetProfit({ ...bet, result }),
    settledAt: new Date().toISOString(),
  };
}
