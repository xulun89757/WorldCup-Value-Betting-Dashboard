import type { Match, Selection } from "@/types/match";
import type { MatchOdds } from "@/types/odds";

const resultSelections: Selection[] = ["home", "draw", "away"];
const oddsKickoffToleranceMs = 6 * 60 * 60 * 1000;

function normalizeName(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]/g, "");
}

function isSameTeam(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (!left || !right) {
    return false;
  }

  return left === right || left.includes(right) || right.includes(left);
}

function isSameKickoff(match: Match, odds: MatchOdds) {
  if (!odds.commenceTime) {
    return true;
  }

  const matchTime = new Date(match.startTime).getTime();
  const oddsTime = new Date(odds.commenceTime).getTime();

  if (!Number.isFinite(matchTime) || !Number.isFinite(oddsTime)) {
    return true;
  }

  return Math.abs(matchTime - oddsTime) <= oddsKickoffToleranceMs;
}

export function isOddsForMatch(match: Match, odds: MatchOdds) {
  if (!odds.homeTeam || !odds.awayTeam) {
    return odds.matchId === match.id;
  }

  const sameDirection =
    isSameTeam(match.homeTeam, odds.homeTeam) &&
    isSameTeam(match.awayTeam, odds.awayTeam);
  const reversedDirection =
    isSameTeam(match.homeTeam, odds.awayTeam) &&
    isSameTeam(match.awayTeam, odds.homeTeam);

  return (sameDirection || reversedDirection) && isSameKickoff(match, odds);
}

export function getOddsForMatch(odds: MatchOdds[], match: Match) {
  return odds.filter((item) => isOddsForMatch(match, item));
}

export function getResultOddsForMatch(odds: MatchOdds[], match: Match) {
  const h2hOdds = getOddsForMatch(odds, match).find(
    (item) => item.marketKey === "h2h",
  );

  if (!h2hOdds) {
    return null;
  }

  const resultOdds: Partial<Record<Selection, number>> = {};

  h2hOdds.outcomes.forEach((outcome) => {
    if (outcome.name === "Draw") {
      resultOdds.draw = outcome.price;
      return;
    }

    if (isSameTeam(outcome.name, match.homeTeam)) {
      resultOdds.home = outcome.price;
      return;
    }

    if (isSameTeam(outcome.name, match.awayTeam)) {
      resultOdds.away = outcome.price;
    }
  });

  if (resultSelections.every((selection) => resultOdds[selection])) {
    return {
      odds: resultOdds as Record<Selection, number>,
      bookmakerTitle: h2hOdds.bookmakerTitle,
      lastUpdate: h2hOdds.lastUpdate,
    };
  }

  return null;
}

export function applyResultOddsToMatch(match: Match, odds: MatchOdds[]) {
  const resultOdds = getResultOddsForMatch(odds, match);

  if (!resultOdds) {
    return {
      ...match,
      oddsMeta: {
        source: "mock" as const,
      },
    };
  }

  return {
    ...match,
    homeOdds: resultOdds.odds.home,
    drawOdds: resultOdds.odds.draw,
    awayOdds: resultOdds.odds.away,
    oddsMeta: {
      source: "api" as const,
      bookmakerTitle: resultOdds.bookmakerTitle,
      lastUpdate: resultOdds.lastUpdate,
    },
  };
}
