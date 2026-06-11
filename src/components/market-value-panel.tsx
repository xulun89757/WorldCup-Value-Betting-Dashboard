"use client";

import { LineChart } from "lucide-react";
import { calculateSpreadCoverProbability, calculateTotalGoalsProbability } from "@/lib/score";
import { calculateImpliedProbability } from "@/lib/odds";
import { getOddsForMatch } from "@/lib/match-odds";
import { useLocalOdds } from "@/lib/use-local-odds";
import { formatPercent, formatSignedPercent } from "@/lib/utils";
import type { Match } from "@/types/match";

function outcomeModelProbability(match: Match, marketKey: string, name: string, point?: number) {
  if (marketKey === "totals" && point != null) {
    if (name === "Over") {
      return calculateTotalGoalsProbability(match, "over", point);
    }

    if (name === "Under") {
      return calculateTotalGoalsProbability(match, "under", point);
    }
  }

  if (marketKey === "spreads" && point != null) {
    if (name === match.homeTeam) {
      return calculateSpreadCoverProbability(match, "home", point);
    }

    if (name === match.awayTeam) {
      return calculateSpreadCoverProbability(match, "away", point);
    }
  }

  return null;
}

export function MarketValuePanel({ match }: { match: Match }) {
  const { odds } = useLocalOdds();
  const markets = getOddsForMatch(odds, match).filter((item) =>
    ["totals", "spreads"].includes(item.marketKey),
  );

  if (markets.length === 0) {
    return (
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text">大小球和让球价值差</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          还没有匹配到大小球或让球赔率。可以先同步真实赔率，或继续手动填写。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text">大小球和让球价值差</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted">
          这里用比分模型估算大小球/让球概率，再和 API 赔率要求的概率比较。
        </p>
      </div>
      <div className="divide-y divide-border">
        {markets.map((market) => (
          <div key={market.id} className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-text">
                {market.marketLabel} · {market.bookmakerTitle}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {market.outcomes.map((outcome) => {
                const modelProbability = outcomeModelProbability(
                  match,
                  market.marketKey,
                  outcome.name,
                  outcome.point,
                );
                const marketProbability =
                  outcome.price > 1 ? calculateImpliedProbability(outcome.price) : 0;
                const valueEdge =
                  modelProbability == null ? null : modelProbability - marketProbability;

                return (
                  <div
                    key={`${market.id}-${outcome.name}-${outcome.point ?? ""}`}
                    className="rounded-md border border-border bg-panel p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-text">
                        {outcome.label}
                        {outcome.point != null ? ` ${outcome.point}` : ""}
                      </p>
                      <p className="text-sm font-semibold text-text">
                        {outcome.price.toFixed(2)}
                      </p>
                    </div>
                    {valueEdge == null ? (
                      <p className="mt-3 text-sm text-muted">暂时无法计算这个盘口。</p>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted">模型</p>
                          <p className="mt-1 text-text">
                            {formatPercent(modelProbability ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">赔率要求</p>
                          <p className="mt-1 text-text">
                            {formatPercent(marketProbability)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">价值差</p>
                          <p
                            className={
                              valueEdge > 0
                                ? "mt-1 font-semibold text-positive"
                                : "mt-1 font-semibold text-danger"
                            }
                          >
                            {formatSignedPercent(valueEdge)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
