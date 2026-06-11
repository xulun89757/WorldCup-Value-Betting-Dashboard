import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Match } from "@/types/match";
import type { getValueOpportunities } from "@/lib/value-edge";
import { formatPercent, formatSignedPercent } from "@/lib/utils";
import { RiskBadge } from "./risk-badge";

type Opportunity = ReturnType<typeof getValueOpportunities>[number] & {
  match: Match;
};

export function ValueOpportunities({
  opportunities,
  limit,
}: {
  opportunities: Opportunity[];
  limit?: number;
}) {
  const visible = limit ? opportunities.slice(0, limit) : opportunities;

  if (visible.length === 0) {
    return (
      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text">
          今日价值机会
        </h2>
        <p className="mt-4 text-sm text-muted">今天暂无价值机会</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold text-text">
          今日价值机会
        </h2>
      </div>
      <div className="divide-y divide-border">
        {visible.map((item) => (
          <Link
            href={`/matches/${item.match.id}`}
            key={`${item.match.id}-${item.selection}`}
            className="grid gap-3 p-4 transition hover:bg-panel sm:grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr_0.7fr_28px] sm:items-center"
          >
            <div>
              <p className="font-medium text-text">
                {item.match.homeTeam} vs {item.match.awayTeam}
              </p>
              <p className="mt-1 text-sm text-muted">{item.label}</p>
            </div>
            <div>
              <p className="text-xs text-muted">模型</p>
              <p className="mt-1 text-sm text-text">
                {formatPercent(item.modelProbability)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">市场</p>
              <p className="mt-1 text-sm text-text">
                {formatPercent(item.marketProbability)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">差值</p>
              <p className="mt-1 text-sm font-semibold text-positive">
                {formatSignedPercent(item.valueEdge)}
              </p>
            </div>
            <RiskBadge level={item.riskLevel} />
            <ArrowUpRight className="hidden h-4 w-4 text-muted sm:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
