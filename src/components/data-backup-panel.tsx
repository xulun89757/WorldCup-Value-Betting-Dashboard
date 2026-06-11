"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";

const backupKeys = [
  "worldcup-dashboard:bets:v1",
  "worldcup-dashboard:api-matches:v1",
  "worldcup-dashboard:api-odds:v1",
] as const;

function collectAiAnalysisKeys() {
  return Object.keys(window.localStorage).filter((key) =>
    key.startsWith("worldcup-dashboard:ai-analysis:"),
  );
}

export function DataBackupPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");

  function exportBackup() {
    const keys = [...backupKeys, ...collectAiAnalysisKeys()];
    const data = keys.reduce<Record<string, string | null>>((result, key) => {
      result[key] = window.localStorage.getItem(key);
      return result;
    }, {});
    const payload = {
      app: "worldcup-value-betting-dashboard",
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `worldcup-dashboard-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("已导出备份文件。");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as {
        app?: string;
        data?: Record<string, string | null>;
      };

      if (
        payload.app !== "worldcup-value-betting-dashboard" ||
        !payload.data
      ) {
        setStatus("导入失败：这不是本项目的备份文件。");
        return;
      }

      Object.entries(payload.data).forEach(([key, value]) => {
        if (
          backupKeys.includes(key as (typeof backupKeys)[number]) ||
          key.startsWith("worldcup-dashboard:ai-analysis:")
        ) {
          if (value == null) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, value);
          }
        }
      });
      setStatus("导入成功。请刷新页面查看恢复后的数据。");
    } catch {
      setStatus("导入失败：文件格式不正确。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h2 className="text-base font-semibold text-text">数据备份和恢复</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          资金记录、同步赛程、同步赔率和 AI 分析都主要保存在当前浏览器里。建议定期导出备份。
        </p>
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={exportBackup}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110"
        >
          <Download size={16} />
          导出全部数据
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-accent hover:text-text"
        >
          <Upload size={16} />
          导入备份
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={importBackup}
          className="hidden"
        />
        {status ? <p className="text-sm text-accent">{status}</p> : null}
      </div>
    </section>
  );
}
