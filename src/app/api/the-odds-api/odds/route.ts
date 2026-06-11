import { NextResponse } from "next/server";
import { findSport, mapTheOddsApiEvents } from "@/lib/the-odds-api";
import type {
  TheOddsApiEvent,
  TheOddsApiSport,
} from "@/types/the-odds-api";

export async function GET() {
  const apiKey = process.env.THE_ODDS_API_KEY;
  const sportKey = process.env.THE_ODDS_API_SPORT ?? "soccer_fifa_world_cup";
  const regions = process.env.THE_ODDS_API_REGIONS ?? "eu";
  const markets = process.env.THE_ODDS_API_MARKETS ?? "h2h,totals,spreads";
  const bookmaker = process.env.THE_ODDS_API_BOOKMAKER ?? "";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "缺少 THE_ODDS_API_KEY。请在 .env.local 中配置后重启服务。",
        odds: [],
      },
      { status: 400 },
    );
  }

  const sportsUrl = new URL("https://api.the-odds-api.com/v4/sports/");
  sportsUrl.searchParams.set("apiKey", apiKey);
  sportsUrl.searchParams.set("all", "true");

  const sportsResponse = await fetch(sportsUrl, {
    next: {
      revalidate: 60 * 60,
    },
  });

  if (!sportsResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `The Odds API 赛事检查失败：${sportsResponse.status}`,
        odds: [],
      },
      { status: sportsResponse.status },
    );
  }

  const sports = (await sportsResponse.json()) as TheOddsApiSport[];
  const sport = findSport(sports, sportKey);

  if (!sport) {
    return NextResponse.json(
      {
        ok: false,
        message: `没有找到赛事代码 ${sportKey}。请先确认 THE_ODDS_API_SPORT。`,
        odds: [],
      },
      { status: 404 },
    );
  }

  const oddsUrl = new URL(
    `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/`,
  );
  oddsUrl.searchParams.set("apiKey", apiKey);
  oddsUrl.searchParams.set("regions", regions);
  oddsUrl.searchParams.set("markets", markets);
  oddsUrl.searchParams.set("oddsFormat", "decimal");

  if (bookmaker) {
    oddsUrl.searchParams.set("bookmakers", bookmaker);
  }

  const oddsResponse = await fetch(oddsUrl, {
    next: {
      revalidate: 60 * 10,
    },
  });

  if (!oddsResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `The Odds API 赔率同步失败：${oddsResponse.status}`,
        odds: [],
      },
      { status: oddsResponse.status },
    );
  }

  const events = (await oddsResponse.json()) as TheOddsApiEvent[];
  const odds = mapTheOddsApiEvents(events, bookmaker);

  return NextResponse.json({
    ok: true,
    source: "the-odds-api",
    sport,
    syncedAt: new Date().toISOString(),
    eventCount: events.length,
    odds,
  });
}
