import {
  BadgeInfo,
  Cable,
  Database,
  FileJson,
  SlidersHorizontal,
} from "lucide-react";
import { AiConfigPanel } from "@/components/ai-config-panel";
import { DataBackupPanel } from "@/components/data-backup-panel";
import { DataSyncPanel } from "@/components/data-sync-panel";
import { OddsMatchingPanel } from "@/components/odds-matching-panel";
import { OddsApiPanel } from "@/components/odds-api-panel";
import { appConfig } from "@/lib/config";
import { matches } from "@/lib/data";

const sourceRows = [
  {
    label: "比赛数据",
    value: appConfig.dataSource.matches,
    detail: "默认使用本地模拟赛程；配置 API Key 后可以同步真实赛程和比分。",
  },
  {
    label: "资金记录",
    value: appConfig.dataSource.bankroll,
    detail: "当前保存在你的浏览器里，清缓存或换设备后可能丢失。",
  },
  {
    label: "赔率数据",
    value: appConfig.dataSource.odds,
    detail:
      "目前胜平负仍可用模拟赔率；The Odds API 的配置结构已准备好，下一步接真实同步。",
  },
  {
    label: "API 状态",
    value: appConfig.dataSource.apiStatus,
    detail: "赛程/比分、赔率、AI 分析都已进入接入流程；缺 Key 时页面会给出提示。",
  },
];

const roadmapRows = [
  {
    version: "V0.2",
    title: "接入赛程和比分 API",
    body: "自动获取比赛时间、状态和最终比分。",
  },
  {
    version: "V0.3",
    title: "接入赔率 API",
    body: "自动获取胜平负、大小球、让球等主要赔率；比分和小众盘口保留手动补充。",
  },
  {
    version: "V0.4",
    title: "接入 AI 分析",
    body: "让 Explain Why 从固定模板升级成真实分析。",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <SlidersHorizontal className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-text">
              设置和数据源
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              这里说明当前数据从哪里来、哪些还是模拟或手动、以后接 API 时要替换哪些部分。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-border bg-surface p-4">
          <BadgeInfo className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">当前版本</p>
          <p className="mt-1 text-xl font-semibold text-text">
            {appConfig.appVersion}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <Database className="h-5 w-5 text-accent" />
          <p className="mt-3 text-sm text-muted">模型版本</p>
          <p className="mt-1 text-xl font-semibold text-text">
            {appConfig.modelVersion}
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <Cable className="h-5 w-5 text-warning" />
          <p className="mt-3 text-sm text-muted">真实 API</p>
          <p className="mt-1 text-xl font-semibold text-text">
            {appConfig.dataSource.apiStatus}
          </p>
        </div>
      </section>

      <DataSyncPanel initialMatches={matches} />

      <OddsApiPanel />

      <OddsMatchingPanel initialMatches={matches} />

      <AiConfigPanel />

      <DataBackupPanel />

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">当前数据来源</h2>
        </div>
        <div className="divide-y divide-border">
          {sourceRows.map((row) => (
            <div
              key={row.label}
              className="grid gap-3 p-4 md:grid-cols-[0.8fr_0.8fr_1.6fr]"
            >
              <p className="font-medium text-text">{row.label}</p>
              <p className="text-sm text-accent">{row.value}</p>
              <p className="text-sm leading-6 text-muted">{row.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">赔率来源规则</h2>
          <p className="mt-1 text-sm text-muted">
            每笔预测都会保存当时的赔率来源和模型版本，方便以后复盘。
          </p>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <div className="rounded-md border border-border bg-panel p-4">
            <FileJson className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-semibold text-text">胜平负</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              当前来自 mock 比赛数据；V0.3 接入后会优先使用 API 赔率。
            </p>
          </div>
          <div className="rounded-md border border-border bg-panel p-4">
            <FileJson className="h-5 w-5 text-warning" />
            <h3 className="mt-3 font-semibold text-text">净胜球</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              当前由你手动填写赔率；V0.3 会先尝试接让球盘口，接不到时继续手填。
            </p>
          </div>
          <div className="rounded-md border border-border bg-panel p-4">
            <FileJson className="h-5 w-5 text-warning" />
            <h3 className="mt-3 font-semibold text-text">比分</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              当前由你手动填写赔率；正确比分属于小众盘口，第一版先不强依赖 API。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-text">API 接入路线</h2>
        </div>
        <div className="divide-y divide-border">
          {roadmapRows.map((row) => (
            <div
              key={row.version}
              className="grid gap-3 p-4 md:grid-cols-[100px_0.8fr_1.5fr]"
            >
              <p className="font-semibold text-accent">{row.version}</p>
              <p className="font-medium text-text">{row.title}</p>
              <p className="text-sm leading-6 text-muted">{row.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
