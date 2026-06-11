import type { FootballDataMatch } from "@/types/football-data";
import type { Match, MatchStatus } from "@/types/match";
import { getMockElo } from "./team-strength";

function mapStatus(status: string): MatchStatus {
  if (status === "FINISHED") {
    return "finished";
  }

  if (["IN_PLAY", "PAUSED", "LIVE"].includes(status)) {
    return "live";
  }

  return "scheduled";
}

function stageLabel(stage: string, group: string | null) {
  if (group) {
    return group;
  }

  return stage
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapFootballDataMatch(match: FootballDataMatch): Match {
  const homeTeam = match.homeTeam.shortName || match.homeTeam.name || "待定主队";
  const awayTeam = match.awayTeam.shortName || match.awayTeam.name || "待定客队";

  return {
    id: `fd-${match.id}`,
    homeTeam,
    awayTeam,
    homeElo: getMockElo(homeTeam),
    awayElo: getMockElo(awayTeam),
    homeOdds: 2.4,
    drawOdds: 3.2,
    awayOdds: 3,
    startTime: match.utcDate,
    stage: stageLabel(match.stage, match.group),
    status: mapStatus(match.status),
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
    riskFactors: [],
  };
}
