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
  memory?: ResearchMemory;
};

export type ResearchResponse = {
  ok: boolean;
  message?: string;
  provider?: string;
  model?: string;
  analysisText?: string;
};

export type TeamProfile = {
  id: string;
  teamName: string;
  rating: string;
  recentForm: string;
  injuries: string;
  motivation: string;
  notes: string;
  updatedAt: string;
};

export type ResearchRecord = {
  id: string;
  createdAt: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  startTime: string;
  oddsSummary: string;
  probabilitySummary: string;
  notes: string;
  analysisText: string;
};

export type ResearchMemory = {
  teamProfiles: TeamProfile[];
  researchRecords: ResearchRecord[];
};
