"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AiMatchAnalysisPanel } from "@/components/ai-match-analysis-panel";
import { MatchApiOddsPanel } from "@/components/match-api-odds-panel";
import { MarketValuePanel } from "@/components/market-value-panel";
import { ProbabilityBars } from "@/components/probability-bars";
import { ScorePredictionCard } from "@/components/score-prediction-card";
import { matches as initialMatches } from "@/lib/data";
import { applyResultOddsToMatch } from "@/lib/match-odds";
import { useLocalOdds } from "@/lib/use-local-odds";
import { useLocalMatches } from "@/lib/use-local-matches";
import { analyzeMatch } from "@/lib/value-edge";
import { calculateScorePrediction } from "@/lib/score";
import { formatFullDateTime } from "@/lib/utils";

export function LocalMatchDetail({ id }: { id: string }) {
  const { matches } = useLocalMatches(initialMatches);
  const { odds } = useLocalOdds();
  const match = matches.find((item) => item.id === id);

  if (!match) {
    return (
      <div className="space-y-6">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text"
        >
          <ArrowLeft size={16} />
          返回比赛
        </Link>
        <section className="rounded-md border border-border bg-surface p-5">
          <h1 className="text-xl font-semibold text-text">没有找到这场比赛</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            如果你刚刚恢复了模拟数据，同步赛程里的比赛详情会暂时不可用。
          </p>
        </section>
      </div>
    );
  }

  const matchWithApiOdds = applyResultOddsToMatch(match, odds);
  const analysis = analyzeMatch(matchWithApiOdds, 500);
  const scorePrediction = calculateScorePrediction(matchWithApiOdds);

  return (
    <div className="space-y-6">
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text"
      >
        <ArrowLeft size={16} />
        返回比赛
      </Link>
      <section className="rounded-md border border-border bg-surface p-5">
        <p className="text-sm text-muted">
          {matchWithApiOdds.stage} · 开赛时间{" "}
          {formatFullDateTime(matchWithApiOdds.startTime)}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-text">
          {matchWithApiOdds.homeTeam} vs {matchWithApiOdds.awayTeam}
        </h1>
        <p className="mt-2 text-sm text-muted">
          状态：
          {matchWithApiOdds.status === "finished"
            ? `已完赛 ${matchWithApiOdds.homeScore ?? "-"}-${matchWithApiOdds.awayScore ?? "-"}`
            : matchWithApiOdds.status === "live"
              ? "进行中"
              : "未开始"}
        </p>
      </section>
      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text">胜平负概率</h2>
        <div className="mt-5">
          <ProbabilityBars analysis={analysis} />
        </div>
      </section>
      <MatchApiOddsPanel match={matchWithApiOdds} />
      <MarketValuePanel match={matchWithApiOdds} />
      <AiMatchAnalysisPanel
        analysis={analysis}
        scorePrediction={scorePrediction}
      />
      <ScorePredictionCard match={matchWithApiOdds} prediction={scorePrediction} />
    </div>
  );
}
