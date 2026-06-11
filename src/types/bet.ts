import type { Selection } from "./match";
import type { OddsSource } from "@/lib/config";

export type BetStatus = "pending" | "settled";
export type BetResult = "win" | "loss" | "void" | "pending";
export type BetPredictionType = "result" | "margin" | "score";
export type MarginSelection =
  | "homeByOne"
  | "homeByTwoPlus"
  | "draw"
  | "awayByOne"
  | "awayByTwoPlus";

export type Bet = {
  id: string;
  matchId: string;
  selection: Selection;
  predictionType?: BetPredictionType;
  marginSelection?: MarginSelection;
  predictedHomeGoals?: number;
  predictedAwayGoals?: number;
  predictionLabel?: string;
  modelProbability?: number;
  marketProbability?: number;
  valueEdge?: number;
  oddsSource?: OddsSource;
  modelVersion?: string;
  stake: number;
  odds: number;
  status: BetStatus;
  result: BetResult;
  profit: number;
  placedAt: string;
  settledAt: string | null;
  notes: string;
};
