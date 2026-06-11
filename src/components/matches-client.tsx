"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Bet } from "@/types/bet";
import type { Match } from "@/types/match";
import { calculateBankrollMetrics } from "@/lib/bankroll";
import { applyResultOddsToMatch } from "@/lib/match-odds";
import { useLocalBets } from "@/lib/use-local-bets";
import { useLocalMatches } from "@/lib/use-local-matches";
import { useLocalOdds } from "@/lib/use-local-odds";
import { formatFullDateTime } from "@/lib/utils";
import { analyzeMatch, getValueOpportunities } from "@/lib/value-edge";
import { MatchCard } from "./match-card";
import { ValueEdgeChart } from "./value-edge-chart";
import { ValueOpportunities } from "./value-opportunities";

type Filter = "all" | "positive" | "high-risk";

export function MatchesClient({
  initialBankroll,
  initialBets,
  matches,
}: {
  initialBankroll: number;
  initialBets: Bet[];
  matches: Match[];
}) {
  const { bets } = useLocalBets(initialBets);
  const {
    matches: activeMatches,
    source,
    syncedAt,
  } = useLocalMatches(matches);
  const { odds: apiOdds, source: oddsSource, syncedAt: oddsSyncedAt } =
    useLocalOdds();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const metrics = calculateBankrollMetrics(initialBankroll, bets);
  const matchesWithApiOdds = useMemo(
    () => activeMatches.map((match) => applyResultOddsToMatch(match, apiOdds)),
    [activeMatches, apiOdds],
  );
  const apiOddsMatchCount = matchesWithApiOdds.filter(
    (match) => match.oddsMeta?.source === "api",
  ).length;
  const analyses = useMemo(
    () =>
      matchesWithApiOdds.map((match) =>
        analyzeMatch(match, metrics.currentBankroll),
      ),
    [matchesWithApiOdds, metrics.currentBankroll],
  );
  const opportunities = getValueOpportunities(analyses);

  const filteredAnalyses = analyses.filter((analysis) => {
    const text = `${analysis.match.homeTeam} ${analysis.match.awayTeam}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase().trim());
    const hasPositiveEdge = analysis.selections.some(
      (selection) => selection.valueEdge > 0,
    );
    const hasHighRisk = analysis.selections.some(
      (selection) => selection.riskLevel === "high",
    );

    if (!matchesQuery) {
      return false;
    }

    if (filter === "positive") {
      return hasPositiveEdge;
    }

    if (filter === "high-risk") {
      return hasHighRisk;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">
            比赛
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            查看全部赛程、最佳价值差和风险标签。
          </p>
          <p className="mt-2 text-xs text-muted">
            当前赛程来源：{source === "api" ? "Football Data API 同步数据" : "本地模拟数据"}
            {syncedAt ? ` · 上次同步 ${formatFullDateTime(syncedAt)}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            当前赔率来源：
            {oddsSource === "api"
              ? `The Odds API，同步匹配到 ${apiOddsMatchCount} 场`
              : "模拟赔率"}
            {oddsSyncedAt ? ` · 上次同步 ${formatFullDateTime(oddsSyncedAt)}` : ""}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[240px_260px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-md border border-border bg-panel pl-9 pr-3 text-sm text-text outline-none focus:border-accent"
              placeholder="搜索球队"
            />
          </label>
          <div className="grid grid-cols-3 rounded-md border border-border bg-panel p-1">
            {(["all", "positive", "high-risk"] as const).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setFilter(item)}
                className={
                  filter === item
                    ? "rounded bg-accent px-2 text-xs font-semibold text-background"
                    : "rounded px-2 text-xs text-muted transition hover:text-text"
                }
              >
                {item === "all"
                  ? "全部"
                  : item === "positive"
                    ? "机会"
                    : "风险"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ValueOpportunities opportunities={opportunities} />
        <section className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">价值差排行图</h2>
          <div className="mt-5">
            <ValueEdgeChart opportunities={opportunities.slice(0, 10)} />
          </div>
        </section>
      </div>

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">
            全部比赛（{filteredAnalyses.length}）
          </h2>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {filteredAnalyses.map((analysis) => (
            <MatchCard key={analysis.match.id} analysis={analysis} />
          ))}
        </div>
      </section>
    </div>
  );
}
