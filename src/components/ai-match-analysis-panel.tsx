"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Brain, Clipboard, RotateCcw, Sparkles, WalletCards } from "lucide-react";
import { useAiAnalysisCache } from "@/lib/ai-analysis-cache";
import type {
  AiMatchAnalysisRequest,
  AiMatchAnalysisResponse,
} from "@/types/ai-analysis";
import type { MatchAnalysis } from "@/types/match";
import type { ScorePrediction } from "@/types/score";

export function AiMatchAnalysisPanel({
  analysis,
  scorePrediction,
}: {
  analysis: MatchAnalysis;
  scorePrediction: ScorePrediction;
}) {
  const [analysisText, setAnalysisText] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { cached, isLoaded, save, clear } = useAiAnalysisCache(
    analysis.match.id,
  );
  const noteSummary = useMemo(
    () =>
      analysisText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(" "),
    [analysisText],
  );
  const bankrollHref = `/bankroll?matchId=${encodeURIComponent(
    analysis.match.id,
  )}&notes=${encodeURIComponent(noteSummary.slice(0, 260))}`;

  useEffect(() => {
    if (cached && !analysisText) {
      setAnalysisText(cached.text);
      setStatus(`${cached.status}（已从本机缓存读取）`);
    }
  }, [analysisText, cached]);

  async function generateAnalysis() {
    setIsLoading(true);
    setStatus("AI 正在整理这场比赛...");

    const payload: AiMatchAnalysisRequest = {
      analysis,
      scorePrediction,
    };

    try {
      const response = await fetch("/api/ai/match-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AiMatchAnalysisResponse;

      if (!response.ok || !data.ok) {
        setStatus(data.message ?? "AI 分析失败，请检查 OpenAI Key。");
        return;
      }

      const nextText = data.analysisText ?? "";
      const nextStatus =
        data.model
          ? `生成完成，服务商：${data.provider ?? "AI"}，模型：${data.model}`
          : "生成完成。";

      setAnalysisText(nextText);
      setStatus(nextStatus);
      save(nextText, nextStatus);
    } catch {
      setStatus("AI 分析失败：网络或服务暂时不可用。");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyAnalysis() {
    if (!analysisText) {
      return;
    }

    await navigator.clipboard.writeText(analysisText);
    setStatus("已复制 AI 分析。");
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text">AI 大白话分析</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted">
            AI 会把模型概率、赔率价值差、比分预测和风险翻译成更容易理解的话。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysisText ? (
            <>
              <button
                type="button"
                onClick={copyAnalysis}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-accent hover:text-text"
              >
                <Clipboard size={16} />
                复制分析
              </button>
              <Link
                href={bankrollHref}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-accent hover:text-text"
              >
                <WalletCards size={16} />
                带到资金页
              </Link>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setAnalysisText("");
                  setStatus("已清空本机缓存。");
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-danger hover:text-danger"
              >
                <RotateCcw size={16} />
                清空缓存
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={generateAnalysis}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles size={16} />
            {isLoading ? "生成中" : analysisText ? "重新生成" : "生成 AI 分析"}
          </button>
        </div>
      </div>

      <div className="p-5">
        {status ? <p className="text-sm text-accent">{status}</p> : null}
        {analysisText ? (
          <div className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-panel p-4 text-sm leading-7 text-text">
            {analysisText}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-panel p-4 text-sm leading-6 text-muted">
            {isLoaded
              ? "还没有生成 AI 分析。已有 Key 后，点击按钮即可生成。"
              : "正在读取本机缓存..."}
          </div>
        )}
      </div>
    </section>
  );
}
