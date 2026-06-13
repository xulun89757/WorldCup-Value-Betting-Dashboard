"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Calculator,
  ClipboardList,
  Database,
  Loader2,
  Save,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { ResearchRequest, ResearchResponse } from "@/types/research";
import { useResearchMemory } from "@/lib/use-research-memory";
import { formatPercent, formatSignedPercent } from "@/lib/utils";

type FormState = {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  startTime: string;
  homeOdds: string;
  drawOdds: string;
  awayOdds: string;
  homeModelProbability: string;
  drawModelProbability: string;
  awayModelProbability: string;
  homeRating: string;
  awayRating: string;
  recentForm: string;
  injuries: string;
  motivation: string;
  venue: string;
  oddsMovement: string;
  bankrollPlan: string;
  riskPreference: string;
  notes: string;
};

const initialForm: FormState = {
  homeTeam: "",
  awayTeam: "",
  competition: "世界杯",
  startTime: "",
  homeOdds: "",
  drawOdds: "",
  awayOdds: "",
  homeModelProbability: "",
  drawModelProbability: "",
  awayModelProbability: "",
  homeRating: "",
  awayRating: "",
  recentForm: "",
  injuries: "",
  motivation: "",
  venue: "中立场",
  oddsMovement: "",
  bankrollPlan: "单场最多不超过本金 1%",
  riskPreference: "保守",
  notes: "",
};

function parseNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseProbability(value: string) {
  const number = parseNumber(value);
  if (number == null) {
    return null;
  }

  return number > 1 ? number / 100 : number;
}

function impliedProbability(odds: number | null) {
  if (odds == null || odds <= 1) {
    return null;
  }

  return 1 / odds;
}

function truncate(value: string, length = 180) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function formatOptionalPercent(value: number | null) {
  return value == null ? "-" : formatPercent(value);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        className="mt-2 h-10 w-full rounded-md border border-border bg-panel px-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-md border border-border bg-panel px-3 py-2 text-sm leading-6 text-text outline-none transition placeholder:text-muted focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function ResearchClient() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [analysisText, setAnalysisText] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    teamProfiles,
    researchRecords,
    memory,
    upsertTeamProfile,
    addResearchRecord,
    clearResearchRecords,
    deleteTeamProfile,
    getTeamProfile,
  } = useResearchMemory();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const probabilityRows = useMemo(() => {
    const rows = [
      {
        label: "主胜",
        odds: parseNumber(form.homeOdds),
        model: parseProbability(form.homeModelProbability),
      },
      {
        label: "平局",
        odds: parseNumber(form.drawOdds),
        model: parseProbability(form.drawModelProbability),
      },
      {
        label: "客胜",
        odds: parseNumber(form.awayOdds),
        model: parseProbability(form.awayModelProbability),
      },
    ];

    return rows.map((row) => {
      const market = impliedProbability(row.odds);
      return {
        ...row,
        market,
        edge: row.model == null || market == null ? null : row.model - market,
      };
    });
  }, [
    form.awayModelProbability,
    form.awayOdds,
    form.drawModelProbability,
    form.drawOdds,
    form.homeModelProbability,
    form.homeOdds,
  ]);

  const homeProfile = getTeamProfile(form.homeTeam);
  const awayProfile = getTeamProfile(form.awayTeam);
  const relevantRecords = researchRecords
    .filter((record) => {
      const text = `${record.homeTeam} ${record.awayTeam}`.toLowerCase();
      const home = form.homeTeam.trim().toLowerCase();
      const away = form.awayTeam.trim().toLowerCase();

      return Boolean(
        (home && text.includes(home)) || (away && text.includes(away)),
      );
    })
    .slice(0, 5);

  function buildPayload(): ResearchRequest {
    return {
      homeTeam: form.homeTeam.trim(),
      awayTeam: form.awayTeam.trim(),
      competition: form.competition.trim(),
      startTime: form.startTime.trim(),
      homeOdds: parseNumber(form.homeOdds),
      drawOdds: parseNumber(form.drawOdds),
      awayOdds: parseNumber(form.awayOdds),
      homeModelProbability: parseProbability(form.homeModelProbability),
      drawModelProbability: parseProbability(form.drawModelProbability),
      awayModelProbability: parseProbability(form.awayModelProbability),
      homeRating: form.homeRating.trim(),
      awayRating: form.awayRating.trim(),
      recentForm: form.recentForm.trim(),
      injuries: form.injuries.trim(),
      motivation: form.motivation.trim(),
      venue: form.venue.trim(),
      oddsMovement: form.oddsMovement.trim(),
      bankrollPlan: form.bankrollPlan.trim(),
      riskPreference: form.riskPreference.trim(),
      notes: form.notes.trim(),
      memory,
    };
  }

  function saveTeamProfiles() {
    if (!form.homeTeam.trim() && !form.awayTeam.trim()) {
      setStatus("请先填写球队名称，再保存球队档案。");
      return;
    }

    if (form.homeTeam.trim()) {
      upsertTeamProfile({
        teamName: form.homeTeam,
        rating: form.homeRating,
        recentForm: form.recentForm,
        injuries: form.injuries,
        motivation: form.motivation,
        notes: form.notes,
      });
    }

    if (form.awayTeam.trim()) {
      upsertTeamProfile({
        teamName: form.awayTeam,
        rating: form.awayRating,
        recentForm: form.recentForm,
        injuries: form.injuries,
        motivation: form.motivation,
        notes: form.notes,
      });
    }

    setStatus("已保存球队档案。以后 AI 分析会参考这些档案。");
  }

  function applyKnownProfiles() {
    setForm((current) => {
      const nextHomeProfile = getTeamProfile(current.homeTeam);
      const nextAwayProfile = getTeamProfile(current.awayTeam);

      return {
        ...current,
        homeRating: nextHomeProfile?.rating || current.homeRating,
        awayRating: nextAwayProfile?.rating || current.awayRating,
        recentForm:
          current.recentForm ||
          [nextHomeProfile, nextAwayProfile]
            .map((profile) =>
              profile?.recentForm
                ? `${profile.teamName}：${profile.recentForm}`
                : "",
            )
            .filter(Boolean)
            .join("\n"),
        injuries:
          current.injuries ||
          [nextHomeProfile, nextAwayProfile]
            .map((profile) =>
              profile?.injuries ? `${profile.teamName}：${profile.injuries}` : "",
            )
            .filter(Boolean)
            .join("\n"),
        motivation:
          current.motivation ||
          [nextHomeProfile, nextAwayProfile]
            .map((profile) =>
              profile?.motivation
                ? `${profile.teamName}：${profile.motivation}`
                : "",
            )
            .filter(Boolean)
            .join("\n"),
        notes:
          current.notes ||
          [nextHomeProfile, nextAwayProfile]
            .map((profile) =>
              profile?.notes ? `${profile.teamName}：${profile.notes}` : "",
            )
            .filter(Boolean)
            .join("\n"),
      };
    });
    setStatus("已尝试套用已有球队档案。");
  }

  async function generateAnalysis() {
    if (!form.homeTeam.trim() || !form.awayTeam.trim()) {
      setStatus("请先填写主队和客队。");
      return;
    }

    setIsLoading(true);
    setStatus("AI 正在整理赛前信息。");

    const payload = buildPayload();

    try {
      const response = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ResearchResponse;

      if (!response.ok || !data.ok) {
        setStatus(data.message ?? "AI 研究失败，请检查配置。");
        return;
      }

      const nextAnalysisText = data.analysisText ?? "";
      setAnalysisText(nextAnalysisText);
      addResearchRecord({
        homeTeam: payload.homeTeam,
        awayTeam: payload.awayTeam,
        competition: payload.competition,
        startTime: payload.startTime,
        oddsSummary: `主胜 ${form.homeOdds || "-"} / 平 ${form.drawOdds || "-"} / 客胜 ${form.awayOdds || "-"}`,
        probabilitySummary: `主胜 ${formatOptionalPercent(payload.homeModelProbability)} / 平 ${formatOptionalPercent(payload.drawModelProbability)} / 客胜 ${formatOptionalPercent(payload.awayModelProbability)}`,
        notes: payload.notes,
        analysisText: nextAnalysisText,
      });
      setStatus(
        `已生成赛前研究，并保存到研究记录。模型：${data.model ?? "未知"}`,
      );
    } catch {
      setStatus("AI 研究失败：网络或服务暂时不可用。");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyAnalysis() {
    if (!analysisText) {
      return;
    }

    await navigator.clipboard.writeText(analysisText);
    setStatus("已复制赛前研究报告。");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-text">
              赛前研究台
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              把你查到的球队实力、赔率、伤停、近况和赔率变化填进来。AI 会参考已保存的球队档案和历史研究记录，但不会保证结果。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold text-text">基础信息</h2>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field
                label="主队"
                onChange={(value) => updateField("homeTeam", value)}
                placeholder="例如 France"
                value={form.homeTeam}
              />
              <Field
                label="客队"
                onChange={(value) => updateField("awayTeam", value)}
                placeholder="例如 Denmark"
                value={form.awayTeam}
              />
              <Field
                label="赛事/阶段"
                onChange={(value) => updateField("competition", value)}
                value={form.competition}
              />
              <Field
                label="开赛时间"
                onChange={(value) => updateField("startTime", value)}
                placeholder="例如 2026-06-12 22:00"
                value={form.startTime}
              />
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold text-text">赔率和你的概率判断</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                概率可以填 58 或 0.58。没有把握可以先空着，AI 会提示“无法严格判断价值差”。
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field
                label="主胜赔率"
                onChange={(value) => updateField("homeOdds", value)}
                placeholder="例如 2.10"
                type="number"
                value={form.homeOdds}
              />
              <Field
                label="平局赔率"
                onChange={(value) => updateField("drawOdds", value)}
                placeholder="例如 3.30"
                type="number"
                value={form.drawOdds}
              />
              <Field
                label="客胜赔率"
                onChange={(value) => updateField("awayOdds", value)}
                placeholder="例如 3.60"
                type="number"
                value={form.awayOdds}
              />
              <Field
                label="你认为主胜概率"
                onChange={(value) => updateField("homeModelProbability", value)}
                placeholder="例如 52"
                type="number"
                value={form.homeModelProbability}
              />
              <Field
                label="你认为平局概率"
                onChange={(value) => updateField("drawModelProbability", value)}
                placeholder="例如 27"
                type="number"
                value={form.drawModelProbability}
              />
              <Field
                label="你认为客胜概率"
                onChange={(value) => updateField("awayModelProbability", value)}
                placeholder="例如 21"
                type="number"
                value={form.awayModelProbability}
              />
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-text">你查到的信息</h2>
                <div className="flex gap-2">
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-accent hover:text-text"
                    onClick={applyKnownProfiles}
                    type="button"
                  >
                    <Database size={15} />
                    套用档案
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-accent hover:text-text"
                    onClick={saveTeamProfiles}
                    type="button"
                  >
                    <Save size={15} />
                    保存球队档案
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <Field
                label="主队排名/ELO/评分"
                onChange={(value) => updateField("homeRating", value)}
                placeholder="例如 FIFA 1859 分，近 10 场 7 胜"
                value={form.homeRating}
              />
              <Field
                label="客队排名/ELO/评分"
                onChange={(value) => updateField("awayRating", value)}
                placeholder="例如 FIFA 1740 分，防守较稳"
                value={form.awayRating}
              />
              <TextArea
                label="近况"
                onChange={(value) => updateField("recentForm", value)}
                placeholder="近 5 场胜平负、进失球、对手强弱"
                value={form.recentForm}
              />
              <TextArea
                label="伤停/轮换"
                onChange={(value) => updateField("injuries", value)}
                placeholder="主力缺阵、门将、前锋、中卫、是否轮休"
                value={form.injuries}
              />
              <TextArea
                label="战意/赛程背景"
                onChange={(value) => updateField("motivation", value)}
                placeholder="是否必须赢、是否已出线、赛程是否密集"
                value={form.motivation}
              />
              <TextArea
                label="赔率变化"
                onChange={(value) => updateField("oddsMovement", value)}
                placeholder="例如主胜从 2.20 降到 1.95，平局抬高"
                value={form.oddsMovement}
              />
              <Field
                label="场地/主客/中立场"
                onChange={(value) => updateField("venue", value)}
                value={form.venue}
              />
              <Field
                label="资金计划"
                onChange={(value) => updateField("bankrollPlan", value)}
                value={form.bankrollPlan}
              />
              <Field
                label="风险偏好"
                onChange={(value) => updateField("riskPreference", value)}
                value={form.riskPreference}
              />
              <TextArea
                label="其他备注"
                onChange={(value) => updateField("notes", value)}
                placeholder="你觉得重要但上面没写到的信息"
                value={form.notes}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                <h2 className="text-base font-semibold text-text">赔率价值速算</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {probabilityRows.map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-3 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted">{row.label}</p>
                    <p className="mt-1 text-text">
                      {row.odds == null ? "-" : row.odds.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">赔率要求</p>
                    <p className="mt-1 text-text">
                      {row.market == null ? "-" : formatPercent(row.market)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">价值差</p>
                    <p
                      className={
                        row.edge == null
                          ? "mt-1 text-muted"
                          : row.edge > 0
                            ? "mt-1 text-positive"
                            : "mt-1 text-danger"
                      }
                    >
                      {row.edge == null ? "-" : formatSignedPercent(row.edge)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-accent" />
                <h2 className="text-base font-semibold text-text">研究档案记忆</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">
                已保存 {teamProfiles.length} 个球队档案、{researchRecords.length} 条研究记录。生成 AI 分析时会一起参考。
              </p>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <div className="rounded-md border border-border bg-panel p-4">
                <h3 className="text-sm font-semibold text-text">当前比赛相关档案</h3>
                <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
                  {[homeProfile, awayProfile].filter(Boolean).length === 0 ? (
                    <p>还没有匹配到这两支球队的档案。</p>
                  ) : (
                    [homeProfile, awayProfile].map((profile) =>
                      profile ? (
                        <div key={profile.id} className="rounded-md border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-text">{profile.teamName}</p>
                            <button
                              className="text-muted transition hover:text-danger"
                              onClick={() => deleteTeamProfile(profile.id)}
                              title="删除档案"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="mt-1">评分：{profile.rating || "未填写"}</p>
                          <p className="mt-1">{truncate(profile.recentForm || profile.notes || "暂无备注")}</p>
                        </div>
                      ) : null,
                    )
                  )}
                </div>
              </div>

              <div className="rounded-md border border-border bg-panel p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-text">相关研究记录</h3>
                  <button
                    className="text-xs text-muted transition hover:text-danger"
                    onClick={clearResearchRecords}
                    type="button"
                  >
                    清空记录
                  </button>
                </div>
                <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
                  {relevantRecords.length === 0 ? (
                    <p>还没有这两支球队相关的历史研究。</p>
                  ) : (
                    relevantRecords.map((record) => (
                      <div key={record.id} className="rounded-md border border-border p-3">
                        <p className="font-medium text-text">
                          {record.homeTeam} vs {record.awayTeam}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {new Date(record.createdAt).toLocaleString("zh-CN")}
                        </p>
                        <p className="mt-1">{truncate(record.analysisText)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm leading-6 text-muted">
                这个页面的目标是减少冲动下注。AI 会结合你填的信息和历史档案做赛前研究，但最后仍然需要你复盘验证。
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                onClick={generateAnalysis}
                type="button"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain size={16} />}
                {isLoading ? "研究中" : "生成赛前研究"}
              </button>
              <button
                className="h-10 rounded-md border border-border bg-panel px-4 text-sm text-muted transition hover:border-accent hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!analysisText}
                onClick={copyAnalysis}
                type="button"
              >
                复制
              </button>
            </div>
            {status ? <p className="mt-3 text-sm text-muted">{status}</p> : null}
          </section>

          <section className="rounded-md border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold text-text">AI 赛前研究报告</h2>
            </div>
            <div className="min-h-72 whitespace-pre-wrap p-5 text-sm leading-7 text-text">
              {analysisText || "填写信息后点击生成。报告会重点看赔率是否值得、风险在哪里、是否应该跳过。"}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
