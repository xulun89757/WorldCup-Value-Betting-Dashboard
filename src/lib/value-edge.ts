import type {
  Match,
  MatchAnalysis,
  RiskLevel,
  Selection,
  SelectionAnalysis,
} from "@/types/match";
import { calculateMatchProbabilities } from "./elo";
import { calculateMarketProbabilities } from "./odds";

const selectionLabels: Record<Selection, string> = {
  home: "主胜",
  draw: "平局",
  away: "客胜",
};

export function calculateValueEdge(
  modelProbability: number,
  marketProbability: number,
) {
  return modelProbability - marketProbability;
}

export function calculateRiskLevel(match: Match, valueEdge: number): RiskLevel {
  const hasHighRisk = match.riskFactors.some(
    (factor) => factor.severity === "high",
  );
  const hasNormalRisk = match.riskFactors.some(
    (factor) => factor.severity === "normal",
  );

  if (hasHighRisk || valueEdge < 0.03) {
    return "high";
  }

  if (hasNormalRisk || valueEdge < 0.08) {
    return "medium";
  }

  return "low";
}

export function calculateSuggestedStake(
  bankroll: number,
  riskLevel: RiskLevel,
) {
  if (riskLevel === "low") {
    return { min: bankroll * 0.03, max: bankroll * 0.05 };
  }

  if (riskLevel === "medium") {
    return { min: bankroll * 0.01, max: bankroll * 0.03 };
  }

  return { min: 0, max: bankroll * 0.01 };
}

export function analyzeMatch(match: Match, bankroll: number): MatchAnalysis {
  const marketProbabilities = calculateMarketProbabilities({
    home: match.homeOdds,
    draw: match.drawOdds,
    away: match.awayOdds,
  });
  const modelProbabilities = calculateMatchProbabilities(
    match.homeElo,
    match.awayElo,
  );

  const selections = (["home", "draw", "away"] as Selection[]).map(
    (selection): SelectionAnalysis => {
      const valueEdge = calculateValueEdge(
        modelProbabilities[selection],
        marketProbabilities[selection],
      );
      const riskLevel = calculateRiskLevel(match, valueEdge);

      return {
        selection,
        label: selectionLabels[selection],
        odds:
          selection === "home"
            ? match.homeOdds
            : selection === "draw"
              ? match.drawOdds
              : match.awayOdds,
        marketProbability: marketProbabilities[selection],
        modelProbability: modelProbabilities[selection],
        valueEdge,
        riskLevel,
        suggestedStake: calculateSuggestedStake(bankroll, riskLevel),
      };
    },
  );

  return {
    match,
    marketProbabilities,
    modelProbabilities,
    selections,
  };
}

type ValueOpportunityOptions = {
  withinHours?: number;
  now?: Date;
};

function isWithinUpcomingHours(
  match: Match,
  withinHours: number,
  now = new Date(),
) {
  const matchTime = new Date(match.startTime).getTime();

  if (!Number.isFinite(matchTime)) {
    return false;
  }

  const nowTime = now.getTime();
  const maxTime = nowTime + withinHours * 60 * 60 * 1000;

  return matchTime >= nowTime && matchTime <= maxTime;
}

export function getValueOpportunities(
  analyses: MatchAnalysis[],
  options: ValueOpportunityOptions = {},
) {
  const riskRank: Record<RiskLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  return analyses
    .flatMap((analysis) =>
      analysis.selections.map((selection) => ({
        match: analysis.match,
        ...selection,
      })),
    )
    .filter((selection) =>
      options.withinHours == null
        ? true
        : isWithinUpcomingHours(
            selection.match,
            options.withinHours,
            options.now,
          ),
    )
    .filter((selection) => selection.valueEdge > 0)
    .sort((a, b) => {
      if (b.valueEdge !== a.valueEdge) {
        return b.valueEdge - a.valueEdge;
      }

      return riskRank[a.riskLevel] - riskRank[b.riskLevel];
    });
}
