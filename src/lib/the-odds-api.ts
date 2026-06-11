import type {
  TheOddsApiBookmaker,
  TheOddsApiEvent,
  TheOddsApiMarket,
  TheOddsApiSport,
} from "@/types/the-odds-api";
import type { MatchOdds, OddsMarketKey } from "@/types/odds";

const marketLabels: Record<OddsMarketKey, string> = {
  h2h: "胜平负",
  totals: "大小球",
  spreads: "让球",
};

function isSupportedMarket(value: string): value is OddsMarketKey {
  return value === "h2h" || value === "totals" || value === "spreads";
}

function outcomeLabel(outcomeName: string, marketKey: OddsMarketKey) {
  if (marketKey === "totals") {
    if (outcomeName === "Over") {
      return "大球";
    }

    if (outcomeName === "Under") {
      return "小球";
    }
  }

  return outcomeName;
}

function chooseBookmaker(
  bookmakers: TheOddsApiBookmaker[],
  preferredBookmaker: string,
) {
  if (!preferredBookmaker) {
    return bookmakers[0] ?? null;
  }

  return (
    bookmakers.find((bookmaker) => bookmaker.key === preferredBookmaker) ??
    bookmakers[0] ??
    null
  );
}

function mapMarketToOdds({
  event,
  bookmaker,
  market,
}: {
  event: TheOddsApiEvent;
  bookmaker: TheOddsApiBookmaker;
  market: TheOddsApiMarket;
}): MatchOdds | null {
  if (!isSupportedMarket(market.key)) {
    return null;
  }

  const marketKey = market.key;

  return {
    id: [
      "toa",
      event.id,
      bookmaker.key,
      marketKey,
      market.last_update,
    ].join("-"),
    matchId: `toa-${event.id}`,
    externalMatchId: event.id,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    provider: "the-odds-api",
    sportKey: event.sport_key,
    bookmakerKey: bookmaker.key,
    bookmakerTitle: bookmaker.title,
    marketKey,
    marketLabel: marketLabels[marketKey],
    outcomes: market.outcomes.map((outcome) => ({
      name: outcome.name,
      label: outcomeLabel(outcome.name, marketKey),
      price: outcome.price,
      point: outcome.point,
    })),
    lastUpdate: market.last_update || bookmaker.last_update,
    source: "api",
  };
}

export function findSport(sports: TheOddsApiSport[], sportKey: string) {
  return sports.find((sport) => sport.key === sportKey) ?? null;
}

export function mapTheOddsApiEvents(
  events: TheOddsApiEvent[],
  preferredBookmaker: string,
) {
  return events.flatMap((event) => {
    const bookmaker = chooseBookmaker(event.bookmakers, preferredBookmaker);

    if (!bookmaker) {
      return [];
    }

    return bookmaker.markets.flatMap((market) => {
      const mapped = mapMarketToOdds({ event, bookmaker, market });
      return mapped ? [mapped] : [];
    });
  });
}
