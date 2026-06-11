export const appConfig = {
  appVersion: "V0.4.0",
  modelVersion: "elo-poisson-v0.4.0",
  dataSource: {
    matches: "Mock Data + Football Data API",
    bankroll: "localStorage",
    odds: "Mock + Manual + The Odds API 准备中",
    apiStatus: "赛程/比分 API、赔率 API 已接入；AI 分析进入 V0.4",
  },
  oddsApi: {
    provider: "The Odds API",
    sport: "soccer_fifa_world_cup",
    regions: "eu",
    markets: "h2h,totals,spreads",
    bookmaker: "",
  },
  oddsSources: {
    result: "mock",
    margin: "manual",
    score: "manual",
  },
  ai: {
    provider: "DeepSeek",
    model: "deepseek-v4-flash",
  },
} as const;

export type OddsSource = "mock" | "manual" | "api";
