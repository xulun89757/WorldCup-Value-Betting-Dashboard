import type { MatchAnalysis, Selection } from "@/types/match";
import { formatPercent, formatSignedPercent } from "@/lib/utils";

const rows: Array<{ key: Selection; label: string }> = [
  { key: "home", label: "主胜" },
  { key: "draw", label: "平局" },
  { key: "away", label: "客胜" },
];

export function ProbabilityBars({ analysis }: { analysis: MatchAnalysis }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const model = analysis.modelProbabilities[row.key];
        const market = analysis.marketProbabilities[row.key];
        const edge = model - market;

        return (
          <div key={row.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-text">{row.label}</span>
              <span className={edge >= 0 ? "text-positive" : "text-danger"}>
                {formatSignedPercent(edge)}
              </span>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-[58px_1fr_52px] items-center gap-2 text-xs text-muted">
                <span>模型</span>
                <div className="h-2 rounded-full bg-panel">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${model * 100}%` }}
                  />
                </div>
                <span className="text-right">{formatPercent(model)}</span>
              </div>
              <div className="grid grid-cols-[58px_1fr_52px] items-center gap-2 text-xs text-muted">
                <span>市场</span>
                <div className="h-2 rounded-full bg-panel">
                  <div
                    className="h-2 rounded-full bg-muted"
                    style={{ width: `${market * 100}%` }}
                  />
                </div>
                <span className="text-right">{formatPercent(market)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
