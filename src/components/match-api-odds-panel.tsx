"use client";

import { TicketPercent } from "lucide-react";
import { getOddsForMatch } from "@/lib/match-odds";
import { useLocalOdds } from "@/lib/use-local-odds";
import { formatFullDateTime } from "@/lib/utils";
import type { Match } from "@/types/match";

export function MatchApiOddsPanel({ match }: { match: Match }) {
  const { odds, source, syncedAt } = useLocalOdds();
  const matchOdds = getOddsForMatch(odds, match);

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <TicketPercent className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text">真实赔率</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          这里显示设置页同步到浏览器里的 The Odds API 赔率。
        </p>
      </div>

      {matchOdds.length === 0 ? (
        <div className="p-5 text-sm leading-6 text-muted">
          还没有匹配到这场比赛的 API 赔率。可以先去设置页点击“同步真实赔率”，
          没有的盘口继续手动填写。
        </div>
      ) : (
        <div className="divide-y divide-border">
          {matchOdds.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 p-4 lg:grid-cols-[0.7fr_1.5fr_0.8fr]"
            >
              <div>
                <p className="font-medium text-text">{item.marketLabel}</p>
                <p className="mt-1 text-sm text-muted">{item.bookmakerTitle}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {item.outcomes.map((outcome) => (
                  <div
                    key={`${item.id}-${outcome.name}-${outcome.point ?? ""}`}
                    className="rounded-md border border-border bg-panel px-3 py-2"
                  >
                    <p className="text-xs text-muted">
                      {outcome.label}
                      {outcome.point != null ? ` ${outcome.point}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {outcome.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-sm leading-6 text-muted">
                <p>来源：{source === "api" ? "API 同步" : "本地缓存"}</p>
                <p>
                  更新：
                  {formatFullDateTime(item.lastUpdate || syncedAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
