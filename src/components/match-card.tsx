import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { MatchAnalysis } from "@/types/match";
import { formatFullDateTime, formatSignedPercent } from "@/lib/utils";
import { RiskBadge } from "./risk-badge";

export function MatchCard({ analysis }: { analysis: MatchAnalysis }) {
  const topSelection = [...analysis.selections].sort(
    (a, b) => b.valueEdge - a.valueEdge,
  )[0];

  return (
    <Link
      href={`/matches/${analysis.match.id}`}
      className="block rounded-md border border-border bg-surface p-4 transition hover:border-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-normal text-muted">
            {analysis.match.stage}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-text">
            {analysis.match.homeTeam} vs {analysis.match.awayTeam}
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-panel px-2 py-1 text-sm text-text">
            <CalendarClock size={14} className="text-accent" />
            <span className="text-muted">开赛</span>
            <span>{formatFullDateTime(analysis.match.startTime)}</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {analysis.match.status === "finished"
              ? `已完赛 ${analysis.match.homeScore ?? "-"}-${analysis.match.awayScore ?? "-"}`
              : analysis.match.status === "live"
                ? "进行中"
                : "未开始"}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 text-muted" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted">最佳差值</p>
          <p
            className={
              topSelection.valueEdge >= 0
                ? "mt-1 font-semibold text-positive"
                : "mt-1 font-semibold text-danger"
            }
          >
            {formatSignedPercent(topSelection.valueEdge)}
          </p>
        </div>
        <div>
          <p className="text-muted">选项</p>
          <p className="mt-1 font-semibold text-text">{topSelection.label}</p>
        </div>
        <div>
          <p className="text-muted">风险</p>
          <div className="mt-1">
            <RiskBadge level={topSelection.riskLevel} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        赔率来源：
        {analysis.match.oddsMeta?.source === "api"
          ? `API${analysis.match.oddsMeta.bookmakerTitle ? ` · ${analysis.match.oddsMeta.bookmakerTitle}` : ""}`
          : "模拟赔率"}
      </p>
    </Link>
  );
}
