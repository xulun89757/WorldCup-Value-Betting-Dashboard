import type { Match } from "@/types/match";
import type { ScorePrediction } from "@/types/score";
import { formatPercent } from "@/lib/utils";

const marginRows = [
  { key: "homeByOne", label: "主队赢 1 球" },
  { key: "homeByTwoPlus", label: "主队赢 2 球以上" },
  { key: "draw", label: "平局" },
  { key: "awayByOne", label: "客队赢 1 球" },
  { key: "awayByTwoPlus", label: "客队赢 2 球以上" },
] as const;

export function ScorePredictionCard({
  match,
  prediction,
}: {
  match: Match;
  prediction: ScorePrediction;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text">比分预测</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          这里先用简化模型估算两队大概能进几个球，再推算常见比分。它适合做参考，不是精确比分答案。
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-panel p-3">
            <p className="text-xs text-muted">{match.homeTeam} 预期进球</p>
            <p className="mt-2 text-2xl font-semibold text-text">
              {prediction.expectedGoals.home.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-panel p-3">
            <p className="text-xs text-muted">{match.awayTeam} 预期进球</p>
            <p className="mt-2 text-2xl font-semibold text-text">
              {prediction.expectedGoals.away.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-text">最可能比分 Top 5</h3>
          <div className="mt-3 grid gap-2">
            {prediction.topScores.map((score, index) => (
              <div
                key={`${score.homeGoals}-${score.awayGoals}`}
                className="grid grid-cols-[36px_1fr_70px] items-center gap-3 rounded-md border border-border bg-panel p-3"
              >
                <span className="text-sm text-muted">#{index + 1}</span>
                <span className="font-semibold text-text">
                  {score.homeGoals} - {score.awayGoals}
                </span>
                <span className="text-right text-sm text-accent">
                  {formatPercent(score.probability)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text">净胜球和大小球</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          净胜球看“赢几个”，大小球看“总进球多不多”。这比只看胜平负更细。
        </p>

        <div className="mt-5 grid gap-3">
          {marginRows.map((row) => {
            const value = prediction.goalMargins[row.key];
            return (
              <div key={row.key}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">{row.label}</span>
                  <span className="text-text">{formatPercent(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-panel">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-panel p-3">
            <p className="text-xs text-muted">大于 2.5 球</p>
            <p className="mt-2 text-xl font-semibold text-positive">
              {formatPercent(prediction.totals.over25)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-panel p-3">
            <p className="text-xs text-muted">小于 2.5 球</p>
            <p className="mt-2 text-xl font-semibold text-warning">
              {formatPercent(prediction.totals.under25)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
