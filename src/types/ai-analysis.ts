import type { MatchAnalysis } from "@/types/match";
import type { ScorePrediction } from "@/types/score";

export type AiMatchAnalysisRequest = {
  analysis: MatchAnalysis;
  scorePrediction: ScorePrediction;
};

export type AiMatchAnalysisResponse = {
  ok: boolean;
  message?: string;
  provider?: string;
  model?: string;
  analysisText?: string;
};
