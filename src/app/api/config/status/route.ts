import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    footballDataApiKeyConfigured: Boolean(process.env.FOOTBALL_DATA_API_KEY),
    footballDataCompetition: process.env.FOOTBALL_DATA_COMPETITION ?? "WC",
    oddsApiKeyConfigured: Boolean(process.env.THE_ODDS_API_KEY),
    oddsApiSport:
      process.env.THE_ODDS_API_SPORT ?? "soccer_fifa_world_cup",
    oddsApiRegions: process.env.THE_ODDS_API_REGIONS ?? "eu",
    oddsApiMarkets: process.env.THE_ODDS_API_MARKETS ?? "h2h,totals,spreads",
    oddsApiBookmaker: process.env.THE_ODDS_API_BOOKMAKER ?? "",
    aiProvider:
      process.env.AI_PROVIDER ??
      (process.env.DEEPSEEK_API_KEY ||
      process.env.AI_MODEL?.startsWith("deepseek") ||
      process.env.OPENAI_MODEL?.startsWith("deepseek")
        ? "deepseek"
        : "openai"),
    aiApiKeyConfigured: Boolean(
      process.env.AI_API_KEY ||
        process.env.DEEPSEEK_API_KEY ||
        process.env.OPENAI_API_KEY,
    ),
    aiModel:
      process.env.AI_MODEL ??
      process.env.DEEPSEEK_MODEL ??
      process.env.OPENAI_MODEL ??
      "deepseek-v4-flash",
  });
}
