import bankrollData from "@/data/bankroll.json";
import betsData from "@/data/bets.json";
import matchesData from "@/data/matches.json";
import type { Bankroll } from "@/types/bankroll";
import type { Bet } from "@/types/bet";
import type { Match } from "@/types/match";
import { calculateBankrollMetrics } from "./bankroll";
import { analyzeMatch } from "./value-edge";

export const matches = matchesData as Match[];
export const bets = betsData as Bet[];
export const bankroll = bankrollData as Bankroll;

export function getBankrollMetrics() {
  return calculateBankrollMetrics(bankroll.initialBankroll, bets);
}

export function getMatchAnalyses() {
  const metrics = getBankrollMetrics();
  return matches.map((match) => analyzeMatch(match, metrics.currentBankroll));
}

export function getMatchAnalysis(id: string) {
  return getMatchAnalyses().find((analysis) => analysis.match.id === id);
}
