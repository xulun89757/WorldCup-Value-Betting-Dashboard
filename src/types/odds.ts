export type OddsProvider = "the-odds-api" | "api-football" | "manual" | "mock";

export type OddsMarketKey = "h2h" | "totals" | "spreads";

export type OddsSource = "api" | "manual" | "mock";

export type OddsOutcome = {
  name: string;
  label: string;
  price: number;
  point?: number;
};

export type MatchOdds = {
  id: string;
  matchId: string;
  externalMatchId?: string;
  homeTeam?: string;
  awayTeam?: string;
  commenceTime?: string;
  provider: OddsProvider;
  sportKey: string;
  bookmakerKey: string;
  bookmakerTitle: string;
  marketKey: OddsMarketKey;
  marketLabel: string;
  outcomes: OddsOutcome[];
  lastUpdate: string;
  source: OddsSource;
};

export type StoredOdds = {
  source: OddsSource;
  syncedAt: string | null;
  odds: MatchOdds[];
};
