"use client";

import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CheckCircle2,
  CircleHelp,
  Percent,
  Trophy,
} from "lucide-react";
import type { Bet } from "@/types/bet";
import type { Match } from "@/types/match";
import { buildReview } from "@/lib/review";
import { useLocalBets } from "@/lib/use-local-bets";
import { useLocalMatches } from "@/lib/use-local-matches";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { StatCard } from "./stat-card";

function betTitle(bet: Bet | null, matchById: Map<string, Match>) {
  if (!bet) {
    return "暂无数据";
  }

  const match = matchById.get(bet.matchId);
  const typeLabel = {
    result: "胜平负",
    margin: "净胜球",
    score: "比分",
  }[bet.predictionType ?? "result"];
  const selection =
    bet.predictionLabel ??
    (bet.selection === "home" ? "主胜" : bet.selection === "draw" ? "平局" : "客胜");

  return `${match ? `${match.homeTeam} vs ${match.awayTeam}` : bet.matchId} · ${typeLabel} · ${selection}`;
}

export function ReviewClient({
  initialBets,
  matches,
}: {
  initialBets: Bet[];
  matches: Match[];
}) {
  const { bets } = useLocalBets(initialBets);
  const { matches: activeMatches } = useLocalMatches(matches);
  const review = buildReview(bets, activeMatches);

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-text">
              复盘
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              这里帮你看“自己做过的预测表现如何”。重点不是证明自己对，而是找到哪些判断值得保留，哪些习惯需要改。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="已结算预测"
          value={String(review.settled.length)}
          icon={CheckCircle2}
        />
        <StatCard
          label="总盈亏"
          value={formatCurrency(review.totalProfit)}
          icon={Banknote}
          tone={review.totalProfit >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="收益率"
          value={formatPercent(review.roi)}
          icon={Percent}
          tone={review.roi >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="命中率"
          value={formatPercent(review.winRate)}
          icon={Trophy}
          tone="positive"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold text-text">按赔率来源复盘</h2>
            <p className="mt-1 text-sm text-muted">
              看 API 赔率、手动赔率、模拟赔率分别表现如何。
            </p>
          </div>
          <div className="divide-y divide-border">
            {review.byOddsSource.map((item) => (
              <div
                key={item.key}
                className="grid gap-3 p-4 sm:grid-cols-[1fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="font-medium text-text">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.count} 笔</p>
                </div>
                <div>
                  <p className="text-xs text-muted">盈亏</p>
                  <p
                    className={
                      item.profit >= 0
                        ? "mt-1 text-sm font-semibold text-positive"
                        : "mt-1 text-sm font-semibold text-danger"
                    }
                  >
                    {formatCurrency(item.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">收益率</p>
                  <p className="mt-1 text-sm text-text">{formatPercent(item.roi)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">命中率</p>
                  <p className="mt-1 text-sm text-text">
                    {formatPercent(item.winRate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-base font-semibold text-text">按价值差复盘</h2>
            <p className="mt-1 text-sm text-muted">
              看正价值差记录是否真的比负价值差更好。
            </p>
          </div>
          <div className="divide-y divide-border">
            {review.byValueEdge.map((item) => (
              <div
                key={item.key}
                className="grid gap-3 p-4 sm:grid-cols-[1fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="font-medium text-text">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.count} 笔</p>
                </div>
                <div>
                  <p className="text-xs text-muted">盈亏</p>
                  <p
                    className={
                      item.profit >= 0
                        ? "mt-1 text-sm font-semibold text-positive"
                        : "mt-1 text-sm font-semibold text-danger"
                    }
                  >
                    {formatCurrency(item.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">收益率</p>
                  <p className="mt-1 text-sm text-text">{formatPercent(item.roi)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">命中率</p>
                  <p className="mt-1 text-sm text-text">
                    {formatPercent(item.winRate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">最佳预测</h2>
          <p className="mt-3 text-lg font-semibold text-text">
            {betTitle(review.bestBet, review.matchById)}
          </p>
          <p className="mt-2 text-sm text-muted">
            盈亏：{" "}
            <span className="font-semibold text-positive">
              {formatCurrency(review.bestBet?.profit ?? 0)}
            </span>
          </p>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">最差预测</h2>
          <p className="mt-3 text-lg font-semibold text-text">
            {betTitle(review.worstBet, review.matchById)}
          </p>
          <p className="mt-2 text-sm text-muted">
            盈亏：{" "}
            <span className="font-semibold text-danger">
              {formatCurrency(review.worstBet?.profit ?? 0)}
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">按预测类型复盘</h2>
          <p className="mt-1 text-sm text-muted">
            看看你更适合做胜平负、净胜球，还是具体比分。
          </p>
        </div>
        <div className="divide-y divide-border">
          {review.byPredictionType.map((item) => (
            <div
              key={item.predictionType}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr]"
            >
              <div>
                <p className="font-medium text-text">{item.label}</p>
                <p className="mt-1 text-sm text-muted">{item.count} 笔已结算</p>
              </div>
              <div>
                <p className="text-xs text-muted">投入</p>
                <p className="mt-1 text-sm text-text">{formatCurrency(item.stake)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">盈亏</p>
                <p
                  className={
                    item.profit >= 0
                      ? "mt-1 text-sm font-semibold text-positive"
                      : "mt-1 text-sm font-semibold text-danger"
                  }
                >
                  {formatCurrency(item.profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">收益率</p>
                <p className="mt-1 text-sm text-text">{formatPercent(item.roi)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">命中率</p>
                <p className="mt-1 text-sm text-text">
                  {formatPercent(item.winRate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <h2 className="text-base font-semibold text-text">复盘提示</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                样本很少时不要急着下结论。至少记录 20 笔以后，再看自己更擅长哪种比赛、哪种结果。
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <h2 className="text-base font-semibold text-text">当前观察</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {review.settled.length === 0
                  ? "还没有已结算记录。先去资金页记录并结算几笔，复盘页就会开始有内容。"
                  : review.totalProfit >= 0
                    ? `目前整体盈利，表现最好的是${review.bestPredictionType.label}。继续保持小金额记录，别因为短期盈利放大金额。`
                    : `目前整体亏损，亏损最多的是${review.worstPredictionType.label}。建议先减少金额，重点写清每笔预测的理由。`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
