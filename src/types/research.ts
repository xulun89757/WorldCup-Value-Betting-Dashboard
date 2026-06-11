export type ResearchDecision = "bet" | "small" | "wait" | "skip";

export type ResearchRequest = {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  startTime: string;
  homeOdds: number | null;
  drawOdds: number | null;
  awayOdds: number | null;
  homeModelProbability: number | null;
  drawModelProbability: number | null;
  awayModelProbability: number | null;
  homeRating: string;
  awayRating: string;
  recentForm: string;
  injuries: string;
  motivation: string;
  venue: string;
  oddsMovement: string;
  bankrollPlan: string;
  riskPreference: string;
  notes: string;
};

export type ResearchResponse = {
  ok: boolean;
  message?: string;
  provider?: string;
  model?: string;
  analysisText?: string;
};
