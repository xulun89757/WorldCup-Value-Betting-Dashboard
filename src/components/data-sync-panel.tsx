"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DownloadCloud, KeyRound, RotateCcw } from "lucide-react";
import type { Match } from "@/types/match";
import { useLocalMatches } from "@/lib/use-local-matches";
import { formatFullDateTime } from "@/lib/utils";

type SyncResponse = {
  ok: boolean;
  message?: string;
  source?: string;
  syncedAt?: string;
  matches: Match[];
};

type ConfigStatus = {
  footballDataApiKeyConfigured: boolean;
  footballDataCompetition: string;
};

export function DataSyncPanel({ initialMatches }: { initialMatches: Match[] }) {
  const { source, matches, syncedAt, saveApiMatches, resetMatches } =
    useLocalMatches(initialMatches);
  const [status, setStatus] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);

  useEffect(() => {
    fetch("/api/config/status")
      .then((response) => response.json())
      .then((data: ConfigStatus) => setConfigStatus(data))
      .catch(() => setConfigStatus(null));
  }, []);

  async function syncMatches() {
    setIsSyncing(true);
    setStatus("正在同步赛程和比分...");

    try {
      const response = await fetch("/api/football-data/matches");
      const data = (await response.json()) as SyncResponse;

      if (!response.ok || !data.ok) {
        setStatus(data.message ?? "同步失败，请检查 API Key。");
        return;
      }

      saveApiMatches(data.matches, data.syncedAt);
      setStatus(`同步成功：${data.matches.length} 场比赛，已按开赛时间排序。`);
    } catch {
      setStatus("同步失败：网络或服务暂时不可用。");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold text-text">赛程和比分同步</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          配置 Football Data API Key 后，点击同步即可拉取真实赛程和已完赛比分。
        </p>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm text-muted">当前使用</p>
          <p className="mt-1 text-lg font-semibold text-text">
            {source === "api" ? "Football Data API 同步数据" : "本地模拟数据"}
          </p>
          <p className="mt-2 text-sm text-muted">
            当前浏览器中有 {matches.length} 场比赛。
          </p>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" />
              <span>
                API Key 状态：
                {configStatus?.footballDataApiKeyConfigured
                  ? "已配置"
                  : "未配置或未检测到"}
              </span>
            </div>
            {configStatus ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>赛事代码：{configStatus.footballDataCompetition}</span>
              </div>
            ) : null}
            {source === "api" ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-positive" />
                <span>同步来源：football-data.org</span>
              </div>
            ) : null}
            {syncedAt ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-positive" />
                <span>上次同步：{formatFullDateTime(syncedAt)}</span>
              </div>
            ) : null}
          </div>
          {status ? <p className="mt-2 text-sm text-accent">{status}</p> : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          <button
            type="button"
            onClick={syncMatches}
            disabled={isSyncing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DownloadCloud size={16} />
            {isSyncing ? "同步中" : "同步真实赛程"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetMatches();
              setStatus("已恢复为本地模拟数据。");
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-accent hover:text-text"
          >
            <RotateCcw size={16} />
            恢复模拟数据
          </button>
        </div>
      </div>
    </section>
  );
}
