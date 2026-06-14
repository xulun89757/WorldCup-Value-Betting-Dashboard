import type { Bet, BetPredictionType } from "@/types/bet";
import type { Match, Selection } from "@/types/match";
import type { OddsSource } from "@/lib/config";

export type SelectionReview = {
  selection: Selection;
  label: string;
  count: number;
  profit: number;
  stake: number;
  winRate: number;
  roi: number;
};

export type PredictionTypeReview = {
  predictionType: BetPredictionType;
  label: string;
  count: number;
  profit: number;
  stake: number;
  winRate: number;
  roi: number;
};

export type GroupReview = {
  key: string;
  label: string;
  count: number;
  profit: number;
  stake: number;
  winRate: number;
  roi: number;
};

const selectionLabels: Record<Selection, string> = {
  home: "主胜",
  draw: "平局",
  away: "客胜",
};
const predictionTypeLabels: Record<BetPredictionType, string> = {
  result: "胜平负",
  margin: "净胜球",
  score: "比分",
  totalGoals: "总进球",
};
const oddsSourceLabels: Record<OddsSource, string> = {
  api: "API 赔率",
  manual: "手动赔率",
  mock: "模拟赔率",
};

function summarizeGroup(key: string, label: string, group: Bet[]): GroupReview {
  const stake = group.reduce((sum, bet) => sum + bet.stake, 0);
  const profit = group.reduce((sum, bet) => sum + bet.profit, 0);
  const wins = group.filter((bet) => bet.result === "win").length;

  return {
    key,
    label,
    count: group.length,
    profit,
    stake,
    winRate: group.length > 0 ? wins / group.length : 0,
    roi: stake > 0 ? profit / stake : 0,
  };
}

export function buildReview(bets: Bet[], matches: Match[]) {
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const settled = bets.filter((bet) => bet.status === "settled");
  const wins = settled.filter((bet) => bet.result === "win");
  const losses = settled.filter((bet) => bet.result === "loss");
  const totalStake = settled.reduce((sum, bet) => sum + bet.stake, 0);
  const totalProfit = settled.reduce((sum, bet) => sum + bet.profit, 0);
  const bestBet = settled.length
    ? [...settled].sort((a, b) => b.profit - a.profit)[0]
    : null;
  const worstBet = settled.length
    ? [...settled].sort((a, b) => a.profit - b.profit)[0]
    : null;

  const bySelection: SelectionReview[] = (["home", "draw", "away"] as const).map(
    (selection) => {
      const group = settled.filter((bet) => bet.selection === selection);
      const stake = group.reduce((sum, bet) => sum + bet.stake, 0);
      const profit = group.reduce((sum, bet) => sum + bet.profit, 0);
      const groupWins = group.filter((bet) => bet.result === "win").length;

      return {
        selection,
        label: selectionLabels[selection],
        count: group.length,
        profit,
        stake,
        winRate: group.length > 0 ? groupWins / group.length : 0,
        roi: stake > 0 ? profit / stake : 0,
      };
    },
  );
  const byPredictionType: PredictionTypeReview[] = (
    ["result", "margin", "totalGoals", "score"] as const
  ).map((predictionType) => {
    const group = settled.filter(
      (bet) => (bet.predictionType ?? "result") === predictionType,
    );
    const stake = group.reduce((sum, bet) => sum + bet.stake, 0);
    const profit = group.reduce((sum, bet) => sum + bet.profit, 0);
    const groupWins = group.filter((bet) => bet.result === "win").length;

    return {
      predictionType,
      label: predictionTypeLabels[predictionType],
      count: group.length,
      profit,
      stake,
      winRate: group.length > 0 ? groupWins / group.length : 0,
      roi: stake > 0 ? profit / stake : 0,
    };
  });
  const byOddsSource = (["api", "manual", "mock"] as const).map((source) =>
    summarizeGroup(
      source,
      oddsSourceLabels[source],
      settled.filter((bet) => (bet.oddsSource ?? "mock") === source),
    ),
  );
  const byValueEdge = [
    summarizeGroup(
      "positive",
      "正价值差",
      settled.filter((bet) => (bet.valueEdge ?? 0) > 0),
    ),
    summarizeGroup(
      "negative",
      "负价值差或无价值差",
      settled.filter((bet) => (bet.valueEdge ?? 0) <= 0),
    ),
  ];

  const bestSelection = [...bySelection].sort((a, b) => b.profit - a.profit)[0];
  const worstSelection = [...bySelection].sort((a, b) => a.profit - b.profit)[0];
  const bestPredictionType = [...byPredictionType].sort(
    (a, b) => b.profit - a.profit,
  )[0];
  const worstPredictionType = [...byPredictionType].sort(
    (a, b) => a.profit - b.profit,
  )[0];

  return {
    settled,
    pending: bets.filter((bet) => bet.status === "pending"),
    wins,
    losses,
    totalStake,
    totalProfit,
    roi: totalStake > 0 ? totalProfit / totalStake : 0,
    winRate: settled.length > 0 ? wins.length / settled.length : 0,
    bestBet,
    worstBet,
    bySelection,
    byPredictionType,
    byOddsSource,
    byValueEdge,
    bestSelection,
    worstSelection,
    bestPredictionType,
    worstPredictionType,
    matchById,
  };
}
