"use client";

import { BadgeCheck, SearchX } from "lucide-react";
import { getOddsForMatch } from "@/lib/match-odds";
import { useLocalMatches } from "@/lib/use-local-matches";
import { useLocalOdds } from "@/lib/use-local-odds";
import type { Match } from "@/types/match";

export function OddsMatchingPanel({ initialMatches }: { initialMatches: Match[] }) {
  const { matches } = useLocalMatches(initialMatches);
  const { odds, syncedAt } = useLocalOdds();
  const rows = matches.map((match) => {
    const matchOdds = getOddsForMatch(odds, match);
    return {
      match,
      markets: Array.from(new Set(matchOdds.map((item) => item.marketLabel))),
      bookmaker: matchOdds[0]?.bookmakerTitle ?? "",
      count: matchOdds.length,
    };
  });
  const matched = rows.filter((row) => row.count > 0);
  const unmatched = rows.filter((row) => row.count === 0);

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold text-text">赔率匹配检查</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          用来确认哪些比赛已经匹配到真实赔率，哪些还在使用模拟赔率。
        </p>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-md border border-border bg-panel p-4">
          <BadgeCheck className="h-5 w-5 text-positive" />
          <p className="mt-3 text-sm text-muted">已匹配比赛</p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {matched.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-panel p-4">
          <SearchX className="h-5 w-5 text-warning" />
          <p className="mt-3 text-sm text-muted">未匹配比赛</p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {unmatched.length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-panel p-4">
          <p className="text-sm text-muted">赔率组数</p>
          <p className="mt-1 text-2xl font-semibold text-text">{odds.length}</p>
          <p className="mt-1 text-xs text-muted">
            {syncedAt ? "已同步真实赔率" : "还没有同步真实赔率"}
          </p>
        </div>
      </div>
      <div className="max-h-[460px] overflow-auto border-t border-border">
        <div className="divide-y divide-border">
          {rows.slice(0, 80).map((row) => (
            <div
              key={row.match.id}
              className="grid gap-3 p-4 md:grid-cols-[1.2fr_0.7fr_1fr]"
            >
              <div>
                <p className="font-medium text-text">
                  {row.match.homeTeam} vs {row.match.awayTeam}
                </p>
                <p className="mt-1 text-xs text-muted">{row.match.stage}</p>
              </div>
              <p
                className={
                  row.count > 0
                    ? "text-sm font-semibold text-positive"
                    : "text-sm font-semibold text-warning"
                }
              >
                {row.count > 0 ? "已匹配" : "未匹配"}
              </p>
              <p className="text-sm leading-6 text-muted">
                {row.count > 0
                  ? `${row.bookmaker} · ${row.markets.join("、")}`
                  : "会继续使用模拟赔率或手动填写。"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
