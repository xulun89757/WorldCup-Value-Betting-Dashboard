"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Clock3,
  DownloadCloud,
  KeyRound,
  RotateCcw,
  TicketPercent,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { useLocalOdds } from "@/lib/use-local-odds";
import { formatFullDateTime } from "@/lib/utils";
import type { MatchOdds } from "@/types/odds";

type ConfigStatus = {
  oddsApiKeyConfigured: boolean;
  oddsApiSport: string;
  oddsApiRegions: string;
  oddsApiMarkets: string;
  oddsApiBookmaker: string;
};

type OddsSyncResponse = {
  ok: boolean;
  message?: string;
  source?: string;
  syncedAt?: string;
  eventCount?: number;
  odds: MatchOdds[];
};

const marketLabels: Record<string, string> = {
  h2h: "胜平负",
  totals: "大小球",
  spreads: "让球",
};

export function OddsApiPanel() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const { odds, source, syncedAt, saveApiOdds, resetOdds } = useLocalOdds();
  const [status, setStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/config/status")
      .then((response) => response.json())
      .then((data: ConfigStatus) => setConfigStatus(data))
      .catch(() => setConfigStatus(null));
  }, []);

  const markets = (
    configStatus?.oddsApiMarkets ?? appConfig.oddsApi.markets
  ).split(",");

  async function syncOdds() {
    setIsSyncing(true);
    setStatus("正在同步赔率...");

    try {
      const response = await fetch("/api/the-odds-api/odds");
      const data = (await response.json()) as OddsSyncResponse;

      if (!response.ok || !data.ok) {
        setStatus(data.message ?? "赔率同步失败，请检查 The Odds API 配置。");
        return;
      }

      saveApiOdds(data.odds, data.syncedAt);
      setStatus(
        `同步成功：${data.eventCount ?? 0} 场比赛，${data.odds.length} 组赔率。`,
      );
    } catch {
      setStatus("赔率同步失败：网络或服务暂时不可用。");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold text-text">赔率 API 准备区</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          这一块先检查 The Odds API 的配置。下一步才会真正拉取赔率。
        </p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-text">Key 状态</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {configStatus?.oddsApiKeyConfigured
              ? "已检测到 The Odds API Key。"
              : "还没有检测到 The Odds API Key，暂时不会自动同步赔率。"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <DownloadCloud className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-text">同步状态</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            当前浏览器中有 {odds.length} 组赔率。
            {source === "api" ? " 当前使用 API 同步数据。" : " 当前还没有 API 赔率。"}
          </p>
          {syncedAt ? (
            <p className="mt-1 text-xs leading-5 text-muted">
              上次同步：{formatFullDateTime(syncedAt)}
            </p>
          ) : null}
          {status ? <p className="mt-2 text-sm text-accent">{status}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={syncOdds}
              disabled={isSyncing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DownloadCloud size={16} />
              {isSyncing ? "同步中" : "同步真实赔率"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetOdds();
                setStatus("已清空浏览器中的 API 赔率。");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm text-muted transition hover:border-accent hover:text-text"
            >
              <RotateCcw size={16} />
              清空赔率
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-accent" />
            <h3 className="font-semibold text-text">准备同步的盘口</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {markets.map((market) => (
              <span
                key={market}
                className="rounded-md border border-border px-2.5 py-1 text-sm text-muted"
              >
                {marketLabels[market] ?? market}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-positive" />
            <h3 className="font-semibold text-text">默认赛事</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {configStatus?.oddsApiSport ?? appConfig.oddsApi.sport}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            这个代码下一步会通过接口再确认一次，避免世界杯代码写错。
          </p>
        </div>

        <div className="rounded-md border border-border bg-panel p-4">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-text">下一步</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            先确认 sport key，再接同步按钮。同步成功后，资金页会优先使用 API
            赔率，没有的盘口仍然手动填写。
          </p>
        </div>
      </div>
    </section>
  );
}
