import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, LineChart, Shield } from "lucide-react";
import { AiMatchAnalysisPanel } from "@/components/ai-match-analysis-panel";
import { MatchApiOddsPanel } from "@/components/match-api-odds-panel";
import { MarketValuePanel } from "@/components/market-value-panel";
import { ProbabilityBars } from "@/components/probability-bars";
import { ProbabilityChart } from "@/components/probability-chart";
import { LocalMatchDetail } from "@/components/local-match-detail";
import { RiskBadge } from "@/components/risk-badge";
import { ScorePredictionCard } from "@/components/score-prediction-card";
import { StatCard } from "@/components/stat-card";
import { matches, getMatchAnalysis } from "@/lib/data";
import { calculateScorePrediction } from "@/lib/score";
import {
  formatCurrency,
  formatFullDateTime,
  formatPercent,
  formatSignedPercent,
} from "@/lib/utils";

export function generateStaticParams() {
  return matches.map((match) => ({
    id: match.id,
  }));
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = getMatchAnalysis(id);

  if (!analysis) {
    return <LocalMatchDetail id={id} />;
  }

  const bestSelection = [...analysis.selections].sort(
    (a, b) => b.valueEdge - a.valueEdge,
  )[0];
  const eloDiff = analysis.match.homeElo - analysis.match.awayElo;
  const riskLabel = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
  }[bestSelection.riskLevel];
  const scorePrediction = calculateScorePrediction(analysis.match);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text"
      >
        <ArrowLeft size={16} />
        返回总览
      </Link>

      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm text-muted">
              {analysis.match.stage} · 开赛时间{" "}
              {formatFullDateTime(analysis.match.startTime)}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-text">
              {analysis.match.homeTeam} vs {analysis.match.awayTeam}
            </h1>
            <p className="mt-2 text-sm text-muted">
              ELO {analysis.match.homeElo} / {analysis.match.awayElo}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-panel px-3 py-2">
              <p className="text-xs text-muted">主胜赔率</p>
              <p className="mt-1 font-semibold text-text">
                {analysis.match.homeOdds.toFixed(2)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-panel px-3 py-2">
              <p className="text-xs text-muted">平局赔率</p>
              <p className="mt-1 font-semibold text-text">
                {analysis.match.drawOdds.toFixed(2)}
              </p>
            </div>
            <div className="rounded-md border border-border bg-panel px-3 py-2">
              <p className="text-xs text-muted">客胜赔率</p>
              <p className="mt-1 font-semibold text-text">
                {analysis.match.awayOdds.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="最佳选项"
          value={bestSelection.label}
          icon={BadgeDollarSign}
          tone={bestSelection.valueEdge > 0 ? "positive" : "danger"}
        />
        <StatCard
          label="价值差"
          value={formatSignedPercent(bestSelection.valueEdge)}
          icon={LineChart}
          tone={bestSelection.valueEdge > 0 ? "positive" : "danger"}
        />
        <StatCard
          label="风险等级"
          value={riskLabel}
          icon={Shield}
          tone={
            bestSelection.riskLevel === "low"
              ? "positive"
              : bestSelection.riskLevel === "medium"
                ? "warning"
                : "danger"
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">概率对比</h2>
          <div className="mt-5">
            <ProbabilityBars analysis={analysis} />
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">图表</h2>
          <div className="mt-5">
            <ProbabilityChart analysis={analysis} />
          </div>
        </section>
      </div>

      <ScorePredictionCard
        match={analysis.match}
        prediction={scorePrediction}
      />

      <MatchApiOddsPanel match={analysis.match} />

      <MarketValuePanel match={analysis.match} />

      <AiMatchAnalysisPanel
        analysis={analysis}
        scorePrediction={scorePrediction}
      />

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">结果选项</h2>
        </div>
        <div className="divide-y divide-border">
          {analysis.selections.map((selection) => (
            <div
              key={selection.selection}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr]"
            >
              <div>
                <p className="font-medium text-text">{selection.label}</p>
                <p className="mt-1 text-sm text-muted">
                  赔率 {selection.odds.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">模型</p>
                <p className="mt-1 text-sm text-text">
                  {formatPercent(selection.modelProbability)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">市场</p>
                <p className="mt-1 text-sm text-text">
                  {formatPercent(selection.marketProbability)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">差值</p>
                <p
                  className={
                    selection.valueEdge >= 0
                      ? "mt-1 text-sm font-semibold text-positive"
                      : "mt-1 text-sm font-semibold text-danger"
                  }
                >
                  {formatSignedPercent(selection.valueEdge)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">风险</p>
                <div className="mt-1">
                  <RiskBadge level={selection.riskLevel} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">为什么是这个判断</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <p>
              {analysis.match.homeTeam} ELO
              {eloDiff >= 0 ? "领先" : "落后"} {Math.abs(eloDiff)} 分。
            </p>
            <p>
              模型给出 {bestSelection.label} 概率{" "}
              {formatPercent(bestSelection.modelProbability)}，市场隐含概率{" "}
              {formatPercent(bestSelection.marketProbability)}。
            </p>
            <p>
              当前价值差为{" "}
              <span className="font-semibold text-positive">
                {formatSignedPercent(bestSelection.valueEdge)}
              </span>
              ，适合按照风险等级控制娱乐仓位。
            </p>
            <p>
              比分模型估算双方预期进球约为{" "}
              {scorePrediction.expectedGoals.home.toFixed(2)} -{" "}
              {scorePrediction.expectedGoals.away.toFixed(2)}，最可能比分是{" "}
              {scorePrediction.topScores[0].homeGoals} -{" "}
              {scorePrediction.topScores[0].awayGoals}。
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">建议金额</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            当前建议只显示金额区间，不自动下注。
          </p>
          <p className="mt-5 text-2xl font-semibold text-text">
            {formatCurrency(bestSelection.suggestedStake.min)} -{" "}
            {formatCurrency(bestSelection.suggestedStake.max)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {analysis.match.riskFactors.length === 0 ? (
              <span className="rounded-md border border-border bg-panel px-2 py-1 text-xs text-muted">
                暂无模拟风险标签
              </span>
            ) : (
              analysis.match.riskFactors.map((factor) => (
                <span
                  key={factor.label}
                  className="rounded-md border border-border bg-panel px-2 py-1 text-xs text-muted"
                >
                  {factor.label}
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
