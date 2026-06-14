"use client";

import {
  Activity,
  Banknote,
  Gauge,
  Lightbulb,
  Percent,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { Bet } from "@/types/bet";
import type { Match } from "@/types/match";
import { calculateBankrollMetrics } from "@/lib/bankroll";
import { applyResultOddsToMatch } from "@/lib/match-odds";
import { useLocalBets } from "@/lib/use-local-bets";
import { useLocalMatches } from "@/lib/use-local-matches";
import { useLocalOdds } from "@/lib/use-local-odds";
import { analyzeMatch, getValueOpportunities } from "@/lib/value-edge";
import { formatCurrency, formatFullDateTime, formatPercent } from "@/lib/utils";
import { MatchCard } from "./match-card";
import { StatCard } from "./stat-card";
import { ValueEdgeChart } from "./value-edge-chart";
import { ValueOpportunities } from "./value-opportunities";

export function DashboardClient({
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
  const metrics = calculateBankrollMetrics(initialBankroll, bets);
  const matchesWithApiOdds = activeMatches.map((match) =>
    applyResultOddsToMatch(match, apiOdds),
  );
  const apiOddsMatchCount = matchesWithApiOdds.filter(
    (match) => match.oddsMeta?.source === "api",
  ).length;
  const analyses = matchesWithApiOdds.map((match) =>
    analyzeMatch(match, metrics.currentBankroll),
  );
  const opportunities = getValueOpportunities(analyses, { withinHours: 48 });
  const topOpportunity = opportunities[0];

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-text">
              今天先看这里
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              你不用先懂所有数字。先看有没有价值机会，再点进比赛详情，最后去资金页记录你的决定。
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
          <div className="grid gap-2 rounded-md border border-border bg-panel p-3 text-sm text-muted lg:w-80">
            <div className="flex items-center gap-2 text-text">
              <Lightbulb size={16} className="text-warning" />
              <span className="font-medium">下一步建议</span>
            </div>
            <p className="leading-6">
              {topOpportunity
                ? `先查看 ${topOpportunity.match.homeTeam} vs ${topOpportunity.match.awayTeam}，它目前排在价值机会第一位。`
                : "未来 48 小时暂时没有正向价值机会，可以先查看比赛页熟悉数据。"}
            </p>
            <Link
              href={topOpportunity ? `/matches/${topOpportunity.match.id}` : "/matches"}
              className="mt-1 inline-flex h-9 items-center justify-center rounded-md bg-accent px-3 text-sm font-semibold text-background transition hover:brightness-110"
            >
              {topOpportunity ? "查看这场比赛" : "查看全部比赛"}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="当前本金"
          value={formatCurrency(metrics.currentBankroll)}
          icon={Banknote}
          tone={metrics.currentBankroll >= initialBankroll ? "positive" : "danger"}
        />
        <StatCard
          label="总盈亏"
          value={formatCurrency(metrics.totalProfit)}
          icon={Trophy}
          tone={metrics.totalProfit >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="收益率"
          value={formatPercent(metrics.roi)}
          icon={Percent}
          tone={metrics.roi >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="最大回撤"
          value={formatPercent(metrics.maxDrawdown)}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="今日比赛"
          value={String(analyses.length)}
          icon={Activity}
        />
        <StatCard
          label="48小时机会"
          value={String(opportunities.length)}
          icon={Gauge}
          tone="positive"
        />
        <StatCard
          label="当前连胜"
          value={String(metrics.winningStreak)}
          icon={Trophy}
          tone="positive"
        />
        <StatCard
          label="当前连败"
          value={String(metrics.losingStreak)}
          icon={ShieldAlert}
          tone={metrics.losingStreak > 0 ? "danger" : "neutral"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <ValueOpportunities opportunities={opportunities} limit={6} />

        <section className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">
            价值差分布
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            价值差就是“模型比市场多看好多少”。数字越高，代表模型和赔率之间的分歧越明显，但不代表一定会赢。
          </p>
          <div className="mt-5">
            <ValueEdgeChart opportunities={opportunities.slice(0, 8)} />
          </div>
        </section>
      </div>

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">比赛看板</h2>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {analyses.slice(0, 6).map((analysis) => (
            <MatchCard key={analysis.match.id} analysis={analysis} />
          ))}
        </div>
      </section>
    </div>
  );
}
