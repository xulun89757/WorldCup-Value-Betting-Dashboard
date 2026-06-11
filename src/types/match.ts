export type MatchStatus = "scheduled" | "live" | "finished";
export type Selection = "home" | "draw" | "away";
export type RiskLevel = "low" | "medium" | "high";

export type RiskFactor = {
  label: string;
  severity: "normal" | "high";
};

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeElo: number;
  awayElo: number;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  startTime: string;
  stage: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  riskFactors: RiskFactor[];
  oddsMeta?: {
    source: "api" | "mock";
    bookmakerTitle?: string;
    lastUpdate?: string;
  };
};

export type SelectionAnalysis = {
  selection: Selection;
  label: string;
  odds: number;
  marketProbability: number;
  modelProbability: number;
  valueEdge: number;
  riskLevel: RiskLevel;
  suggestedStake: {
    min: number;
    max: number;
  };
};

export type MatchAnalysis = {
  match: Match;
  marketProbabilities: Record<Selection, number>;
  modelProbabilities: Record<Selection, number>;
  selections: SelectionAnalysis[];
};
