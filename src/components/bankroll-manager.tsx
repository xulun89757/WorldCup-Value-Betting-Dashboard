"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  CircleHelp,
  Download,
  Pencil,
  Percent,
  RotateCcw,
  Save,
  ShieldAlert,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import type {
  Bet,
  BetPredictionType,
  BetResult,
  BetStatus,
  MarginSelection,
  TotalGoalsSelection,
} from "@/types/bet";
import type { Match, Selection } from "@/types/match";
import { calculateBankrollMetrics } from "@/lib/bankroll";
import { calculateBetProfit, settleBet } from "@/lib/bet-utils";
import { appConfig } from "@/lib/config";
import { calculateMatchProbabilities } from "@/lib/elo";
import {
  applyResultOddsToMatch,
  getResultOddsForMatch,
} from "@/lib/match-odds";
import { calculateImpliedProbability } from "@/lib/odds";
import {
  calculateExactScoreProbability,
  calculateScorePrediction,
  calculateTotalGoalsBucketProbability,
} from "@/lib/score";
import { useLocalBets } from "@/lib/use-local-bets";
import { useLocalMatches } from "@/lib/use-local-matches";
import { useLocalOdds } from "@/lib/use-local-odds";
import {
  cn,
  formatCurrency,
  formatFullDateTime,
  formatPercent,
  formatSignedPercent,
} from "@/lib/utils";
import { BankrollChart } from "./bankroll-chart";
import { StatCard } from "./stat-card";

const selections: Selection[] = ["home", "draw", "away"];
const predictionTypes: Array<{ value: BetPredictionType; label: string }> = [
  { value: "result", label: "胜平负" },
  { value: "margin", label: "净胜球" },
  { value: "totalGoals", label: "总进球" },
  { value: "score", label: "比分" },
];
const marginSelections: Array<{ value: MarginSelection; label: string }> = [
  { value: "homeByOne", label: "主队赢 1 球" },
  { value: "homeByTwoPlus", label: "主队赢 2 球以上" },
  { value: "draw", label: "平局" },
  { value: "awayByOne", label: "客队赢 1 球" },
  { value: "awayByTwoPlus", label: "客队赢 2 球以上" },
];
const matchStatusFilters = [
  { value: "all", label: "全部比赛" },
  { value: "scheduled", label: "未开始" },
  { value: "live", label: "进行中" },
  { value: "finished", label: "已结束" },
] as const;

type MatchStatusFilter = (typeof matchStatusFilters)[number]["value"];
const totalGoalsSelections: Array<{
  value: TotalGoalsSelection;
  label: string;
}> = [
  { value: "0", label: "0 球" },
  { value: "1", label: "1 球" },
  { value: "2", label: "2 球" },
  { value: "3", label: "3 球" },
  { value: "4", label: "4 球" },
  { value: "5", label: "5 球" },
  { value: "6", label: "6 球" },
  { value: "7plus", label: "7+ 球" },
];

function getSelectionOdds(match: Match, selection: Selection) {
  if (selection === "home") {
    return match.homeOdds;
  }

  if (selection === "draw") {
    return match.drawOdds;
  }

  return match.awayOdds;
}

function getSelectionLabel(match: Match, selection: Selection) {
  if (selection === "home") {
    return match.homeTeam;
  }

  if (selection === "draw") {
    return "平局";
  }

  return match.awayTeam;
}

function getBetPredictionLabel(bet: Bet, match?: Match) {
  if (bet.predictionLabel) {
    return bet.predictionLabel;
  }

  if (bet.predictionType === "score") {
    return `${bet.predictedHomeGoals ?? 0}-${bet.predictedAwayGoals ?? 0}`;
  }

  if (bet.predictionType === "margin" && bet.marginSelection) {
    return (
      marginSelections.find((item) => item.value === bet.marginSelection)?.label ??
      "净胜球"
    );
  }

  if (bet.predictionType === "totalGoals") {
    if (bet.totalGoalsSelection) {
      return (
        totalGoalsSelections.find(
          (item) => item.value === bet.totalGoalsSelection,
        )?.label ?? "总进球"
      );
    }

    return `${bet.totalGoalsDirection === "under" ? "小于" : "大于"} ${
      bet.totalGoalsPoint ?? 2.5
    } 球`;
  }

  if (!match) {
    return bet.selection === "home"
      ? "主胜"
      : bet.selection === "draw"
        ? "平局"
        : "客胜";
  }

  return getSelectionLabel(match, bet.selection);
}

function getPredictionTypeLabel(type?: BetPredictionType) {
  return predictionTypes.find((item) => item.value === (type ?? "result"))?.label;
}

function getMatchStatusLabel(match: Match) {
  if (match.status === "finished") {
    return `已结束 ${match.homeScore ?? "-"}-${match.awayScore ?? "-"}`;
  }

  if (match.status === "live") {
    return "进行中";
  }

  return "未开始";
}

export function BankrollManager({
  initialBankroll,
  initialBets,
  matches,
}: {
  initialBankroll: number;
  initialBets: Bet[];
  matches: Match[];
}) {
  const searchParams = useSearchParams();
  const { bets, setBets, resetBets } = useLocalBets(initialBets);
  const { matches: activeMatches } = useLocalMatches(matches);
  const { odds: apiOdds } = useLocalOdds();
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [predictionType, setPredictionType] =
    useState<BetPredictionType>("result");
  const [selection, setSelection] = useState<Selection>("home");
  const [marginSelection, setMarginSelection] =
    useState<MarginSelection>("homeByOne");
  const [totalGoalsSelection, setTotalGoalsSelection] =
    useState<TotalGoalsSelection>("2");
  const [predictedHomeGoals, setPredictedHomeGoals] = useState("1");
  const [predictedAwayGoals, setPredictedAwayGoals] = useState("0");
  const [stake, setStake] = useState("10");
  const [manualOdds, setManualOdds] = useState("");
  const [notes, setNotes] = useState("");
  const [matchSearch, setMatchSearch] = useState("");
  const [matchStatusFilter, setMatchStatusFilter] =
    useState<MatchStatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStake, setEditStake] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editResult, setEditResult] = useState<BetResult>("pending");

  useEffect(() => {
    const nextMatchId = searchParams.get("matchId");
    const nextNotes = searchParams.get("notes");

    if (nextMatchId) {
      setMatchId(nextMatchId);
    }

    if (nextNotes) {
      setNotes(nextNotes);
    }
  }, [searchParams]);

  const metrics = calculateBankrollMetrics(initialBankroll, bets);
  const activeMatchesWithApiOdds = useMemo(
    () => activeMatches.map((match) => applyResultOddsToMatch(match, apiOdds)),
    [activeMatches, apiOdds],
  );
  const matchOptions = useMemo(() => {
    const normalizedSearch = matchSearch.trim().toLowerCase();

    return activeMatchesWithApiOdds.filter((match) => {
      const matchesStatus =
        matchStatusFilter === "all" || match.status === matchStatusFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${match.homeTeam} ${match.awayTeam} ${match.stage}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [activeMatchesWithApiOdds, matchSearch, matchStatusFilter]);
  const visibleMatchOptions =
    matchOptions.length > 0
      ? matchOptions
      : activeMatchesWithApiOdds.filter((match) => match.id === matchId);
  const selectedMatch =
    activeMatchesWithApiOdds.find((match) => match.id === matchId) ??
    activeMatchesWithApiOdds[0];
  const selectedApiResultOdds = selectedMatch
    ? getResultOddsForMatch(apiOdds, selectedMatch)
    : null;
  const selectedOdds = selectedMatch
    ? getSelectionOdds(selectedMatch, selection)
    : 1;
  const displayOdds =
    predictionType === "result" && manualOdds.trim() === ""
      ? selectedOdds
      : Number(manualOdds);
  const scorePrediction = selectedMatch
    ? calculateScorePrediction(selectedMatch)
    : null;
  const scoreHome = Number(predictedHomeGoals);
  const scoreAway = Number(predictedAwayGoals);
  const modelProbability = selectedMatch
    ? predictionType === "result"
      ? calculateMatchProbabilities(
          selectedMatch.homeElo,
          selectedMatch.awayElo,
        )[selection]
      : predictionType === "margin" && scorePrediction
        ? scorePrediction.goalMargins[marginSelection]
        : predictionType === "totalGoals"
          ? calculateTotalGoalsBucketProbability(
              selectedMatch,
              totalGoalsSelection,
            )
          : Number.isInteger(scoreHome) &&
              Number.isInteger(scoreAway) &&
              scoreHome >= 0 &&
              scoreAway >= 0
            ? calculateExactScoreProbability(selectedMatch, scoreHome, scoreAway)
            : 0
    : 0;
  const marketProbability =
    Number.isFinite(displayOdds) && displayOdds > 1
      ? calculateImpliedProbability(displayOdds)
      : 0;
  const valueEdge = modelProbability - marketProbability;
  const hasUsableOdds = marketProbability > 0;
  const currentOddsSource =
    predictionType === "result" && manualOdds.trim() === ""
      ? selectedApiResultOdds
        ? "api"
        : "mock"
      : "manual";

  const matchById = useMemo(
    () => new Map(activeMatchesWithApiOdds.map((match) => [match.id, match])),
    [activeMatchesWithApiOdds],
  );

  function addBet() {
    const numericStake = Number(stake);
    const numericOdds = displayOdds;
    const homeScore = Number(predictedHomeGoals);
    const awayScore = Number(predictedAwayGoals);

    if (
      !selectedMatch ||
      !Number.isFinite(numericStake) ||
      numericStake <= 0 ||
      !Number.isFinite(numericOdds) ||
      numericOdds <= 1
    ) {
      return;
    }

    if (
      predictionType === "score" &&
      (!Number.isInteger(homeScore) ||
        !Number.isInteger(awayScore) ||
        homeScore < 0 ||
        awayScore < 0)
    ) {
      return;
    }

    const predictionLabel =
      predictionType === "result"
        ? getSelectionLabel(selectedMatch, selection)
        : predictionType === "margin"
          ? marginSelections.find((item) => item.value === marginSelection)
              ?.label ?? "净胜球"
          : predictionType === "totalGoals"
            ? totalGoalsSelections.find(
                (item) => item.value === totalGoalsSelection,
              )?.label ?? "总进球"
            : `${homeScore}-${awayScore}`;

    const bet: Bet = {
      id: `bet-${Date.now()}`,
      matchId: selectedMatch.id,
      selection,
      predictionType,
      marginSelection: predictionType === "margin" ? marginSelection : undefined,
      totalGoalsSelection:
        predictionType === "totalGoals" ? totalGoalsSelection : undefined,
      predictedHomeGoals: predictionType === "score" ? homeScore : undefined,
      predictedAwayGoals: predictionType === "score" ? awayScore : undefined,
      predictionLabel,
      modelProbability,
      marketProbability,
      valueEdge,
      oddsSource: currentOddsSource,
      modelVersion: appConfig.modelVersion,
      stake: numericStake,
      odds: numericOdds,
      status: "pending",
      result: "pending",
      profit: 0,
      placedAt: new Date().toISOString(),
      settledAt: null,
      notes: notes.trim() || "手动记录",
    };

    setBets((current) => [bet, ...current]);
    setStake("10");
    setManualOdds("");
    setNotes("");
  }

  function settlePendingBet(id: string, result: Exclude<BetResult, "pending">) {
    setBets((current) =>
      current.map((bet) => (bet.id === id ? settleBet(bet, result) : bet)),
    );
  }

  function startEdit(bet: Bet) {
    setEditingId(bet.id);
    setEditStake(String(bet.stake));
    setEditNotes(bet.notes);
    setEditResult(bet.result);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditStake("");
    setEditNotes("");
    setEditResult("pending");
  }

  function saveEdit(id: string) {
    const numericStake = Number(editStake);

    if (!Number.isFinite(numericStake) || numericStake <= 0) {
      return;
    }

    setBets((current) =>
      current.map((bet) => {
        if (bet.id !== id) {
          return bet;
        }

        const nextStatus: BetStatus =
          editResult === "pending" ? "pending" : "settled";
        const nextBet = {
          ...bet,
          stake: numericStake,
          notes: editNotes.trim() || "手动记录",
          status: nextStatus,
          result: editResult,
          settledAt:
            nextStatus === "settled"
              ? bet.settledAt ?? new Date().toISOString()
              : null,
        };

        return {
          ...nextBet,
          profit:
            nextStatus === "settled"
              ? calculateBetProfit(nextBet)
              : 0,
        };
      }),
    );
    cancelEdit();
  }

  function deleteBet(id: string) {
    setBets((current) => current.filter((bet) => bet.id !== id));
  }

  function exportCsv() {
    const rows = [
      [
        "id",
        "match",
        "predictionType",
        "prediction",
        "modelProbability",
        "marketProbability",
        "valueEdge",
        "oddsSource",
        "modelVersion",
        "selection",
        "stake",
        "odds",
        "status",
        "result",
        "profit",
        "placedAt",
        "settledAt",
        "notes",
      ],
      ...bets.map((bet) => {
        const match = matchById.get(bet.matchId);
        return [
          bet.id,
          match ? `${match.homeTeam} vs ${match.awayTeam}` : bet.matchId,
          getPredictionTypeLabel(bet.predictionType) ?? "胜平负",
          getBetPredictionLabel(bet, match),
          bet.modelProbability != null ? String(bet.modelProbability) : "",
          bet.marketProbability != null ? String(bet.marketProbability) : "",
          bet.valueEdge != null ? String(bet.valueEdge) : "",
          bet.oddsSource ?? "",
          bet.modelVersion ?? "",
          bet.selection,
          String(bet.stake),
          String(bet.odds),
          bet.status,
          bet.result,
          String(bet.profit),
          bet.placedAt,
          bet.settledAt ?? "",
          bet.notes,
        ];
      }),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "worldcup-bet-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-text">
          资金管理
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          这里像一个预测记账本。先记录你的想法，比赛结束后再结算结果，系统会自动算资金变化。
        </p>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <h2 className="text-base font-semibold text-text">下一步该做什么？</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                "先选一场比赛，再选预测类型。",
                "输入一个小金额，并写一句为什么这样想。",
                "比赛结束后，在记录里点赢、输或走水。",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-md border border-border bg-panel p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="当前本金"
          value={formatCurrency(metrics.currentBankroll)}
          icon={Banknote}
          tone={metrics.currentBankroll >= initialBankroll ? "positive" : "danger"}
        />
        <StatCard
          label="总盈亏"
          value={formatCurrency(metrics.totalProfit)}
          icon={Trophy}
          tone={metrics.totalProfit >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="收益率"
          value={formatPercent(metrics.roi)}
          icon={Percent}
          tone={metrics.roi >= 0 ? "positive" : "danger"}
        />
        <StatCard
          label="命中率"
          value={formatPercent(metrics.winRate)}
          icon={Target}
          tone="positive"
        />
        <StatCard
          label="最大回撤"
          value={formatPercent(metrics.maxDrawdown)}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="已结算"
          value={String(metrics.settledBets)}
          icon={Target}
        />
        <StatCard
          label="最大连胜"
          value={String(metrics.winningStreak)}
          icon={Trophy}
          tone="positive"
        />
        <StatCard
          label="待结算"
          value={String(metrics.pendingBets)}
          icon={Banknote}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-md border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text">记录一笔预测</h2>
              <p className="mt-1 text-sm text-muted">
                可以记录胜平负、净胜球或具体比分；这一步只是记账，不会真的下注。
              </p>
            </div>
            <button
              type="button"
              onClick={resetBets}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-danger hover:text-danger"
            >
              <RotateCcw size={15} />
              恢复示例
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-muted">比赛</span>
              <div className="grid gap-2 md:grid-cols-[1fr_160px]">
                <input
                  value={matchSearch}
                  onChange={(event) => setMatchSearch(event.target.value)}
                  placeholder="搜索球队或阶段，方便赛后补录"
                  className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none placeholder:text-muted focus:border-accent"
                />
                <select
                  value={matchStatusFilter}
                  onChange={(event) =>
                    setMatchStatusFilter(event.target.value as MatchStatusFilter)
                  }
                  className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none focus:border-accent"
                >
                  {matchStatusFilters.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={matchId}
                onChange={(event) => setMatchId(event.target.value)}
                className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none focus:border-accent"
              >
                {visibleMatchOptions.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.homeTeam} vs {match.awayTeam} ·{" "}
                    {getMatchStatusLabel(match)} ·{" "}
                    {formatFullDateTime(match.startTime)}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-5 text-muted">
                已结束比赛也会显示。赛后补录时可以把筛选切到“已结束”，再搜索球队名。
              </span>
            </label>

            <div className="grid gap-2">
              <p className="text-sm text-muted">预测类型</p>
              <div className="grid grid-cols-4 gap-2">
                {predictionTypes.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setPredictionType(item.value)}
                    className={cn(
                      "h-10 rounded-md border px-2 text-sm transition",
                      predictionType === item.value
                        ? "border-accent bg-accent text-background"
                        : "border-border bg-panel text-muted hover:text-text",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {predictionType === "result" ? (
              <div className="grid gap-2">
                <p className="text-sm text-muted">你看好的结果</p>
                <div className="grid grid-cols-3 gap-2">
                  {selections.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setSelection(item)}
                      className={cn(
                        "h-10 rounded-md border px-2 text-sm transition",
                        selection === item
                          ? "border-accent bg-accent text-background"
                          : "border-border bg-panel text-muted hover:text-text",
                      )}
                    >
                      {selectedMatch ? getSelectionLabel(selectedMatch, item) : item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {predictionType === "margin" ? (
              <div className="grid gap-2">
                <p className="text-sm text-muted">你预测的净胜球</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {marginSelections.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setMarginSelection(item.value)}
                      className={cn(
                        "h-10 rounded-md border px-2 text-sm transition",
                        marginSelection === item.value
                          ? "border-accent bg-accent text-background"
                          : "border-border bg-panel text-muted hover:text-text",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {predictionType === "score" ? (
              <div className="grid gap-2">
                <p className="text-sm text-muted">你预测的比分</p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    value={predictedHomeGoals}
                    onChange={(event) => setPredictedHomeGoals(event.target.value)}
                    type="number"
                    min="0"
                    step="1"
                    className="h-10 rounded-md border border-border bg-panel px-3 text-center text-text outline-none focus:border-accent"
                  />
                  <span className="text-muted">-</span>
                  <input
                    value={predictedAwayGoals}
                    onChange={(event) => setPredictedAwayGoals(event.target.value)}
                    type="number"
                    min="0"
                    step="1"
                    className="h-10 rounded-md border border-border bg-panel px-3 text-center text-text outline-none focus:border-accent"
                  />
                </div>
              </div>
            ) : null}

            {predictionType === "totalGoals" ? (
              <div className="grid gap-3">
                <p className="text-sm text-muted">你预测的总进球</p>
                <label className="grid gap-2 text-sm">
                  <span className="text-muted">总进球数量</span>
                  <select
                    value={totalGoalsSelection}
                    onChange={(event) =>
                      setTotalGoalsSelection(
                        event.target.value as TotalGoalsSelection,
                      )
                    }
                    className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none focus:border-accent"
                  >
                    {totalGoalsSelections.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            <div className="grid gap-2">
              <p className="text-sm text-muted">参考</p>
              <div className="rounded-md border border-border bg-panel p-3 text-sm leading-6 text-muted">
                {predictionType === "result"
                  ? selectedApiResultOdds
                    ? `胜平负已优先使用 API 赔率，来源：${selectedApiResultOdds.bookmakerTitle}。你也可以手动改赔率。`
                    : "胜平负会自动带入当前比赛的主胜、平局或客胜模拟赔率；同步真实赔率后会优先使用 API。"
                  : predictionType === "margin"
                    ? "净胜球赔率暂时需要手动填写。后面会尝试把 API 的让球盘口接进来。"
                    : predictionType === "totalGoals"
                      ? "总进球赔率暂时需要手动填写。系统会用比分模型估算 0、1、2、3、4、5、6、7+ 各档概率。"
                      : "比分赔率暂时需要手动填写。正确比分属于小众盘口，第一版先不强依赖 API。"}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="text-muted">金额</span>
                <input
                  value={stake}
                  onChange={(event) => setStake(event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none focus:border-accent"
                />
              </label>
              <div className="grid gap-2 text-sm">
                <span className="text-muted">赔率</span>
                <input
                  value={
                    predictionType === "result" && manualOdds.trim() === ""
                      ? selectedOdds.toFixed(2)
                      : manualOdds
                  }
                  onChange={(event) => setManualOdds(event.target.value)}
                  type="number"
                  min="1.01"
                  step="0.01"
                  className="h-10 rounded-md border border-border bg-panel px-3 text-text outline-none focus:border-accent"
                />
                <span className="text-xs text-muted">
                  来源：
                  {currentOddsSource === "api"
                    ? "API 赔率"
                    : currentOddsSource === "mock"
                      ? "模拟赔率"
                      : "手动填写"}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "rounded-md border p-3",
                !hasUsableOdds
                  ? "border-warning/40 bg-warning/10"
                  : valueEdge > 0
                    ? "border-positive/40 bg-positive/10"
                    : "border-danger/40 bg-danger/10",
              )}
            >
              <p className="text-sm font-semibold text-text">赔率价值提示</p>
              {!hasUsableOdds ? (
                <p className="mt-2 text-sm leading-6 text-muted">
                  请先填写大于 1.00 的赔率，系统才可以判断这笔预测值不值得。
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted">模型概率</p>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {formatPercent(modelProbability)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">赔率要求概率</p>
                    <p className="mt-1 text-sm font-semibold text-text">
                      {formatPercent(marketProbability)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">价值差</p>
                    <p
                      className={
                        valueEdge > 0
                          ? "mt-1 text-sm font-semibold text-positive"
                          : "mt-1 text-sm font-semibold text-danger"
                      }
                    >
                      {formatSignedPercent(valueEdge)}
                    </p>
                  </div>
                  <p className="sm:col-span-3 text-sm leading-6 text-muted">
                    {valueEdge > 0
                      ? "模型概率高于赔率要求概率，这个赔率从价值角度是正向的。"
                      : "赔率要求的命中率高于模型判断，哪怕看起来有机会，也可能不划算。"}
                  </p>
                </div>
              )}
            </div>

            <label className="grid gap-2 text-sm">
              <span className="text-muted">备注</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="resize-none rounded-md border border-border bg-panel px-3 py-2 text-text outline-none focus:border-accent"
                placeholder="例如：模型更看好主胜，但市场赔率没有完全体现"
              />
            </label>

            <button
              type="button"
              onClick={addBet}
              className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-background transition hover:brightness-110"
            >
              记录下来，等比赛结束再结算
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-text">资金曲线</h2>
          <div className="mt-5">
            <BankrollChart history={metrics.bankrollHistory} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-text">预测记录</h2>
            <p className="mt-1 text-sm text-muted">
              待结算的记录会显示“赢 / 输 / 走水”按钮，点完后资金会自动更新。
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-panel px-3 text-sm text-muted transition hover:border-accent hover:text-text"
          >
            <Download size={15} />
            导出记录
          </button>
        </div>
        <div className="divide-y divide-border">
          {bets.map((bet) => {
            const match = matchById.get(bet.matchId);
            const isEditing = editingId === bet.id;

            return (
              <div
                key={bet.id}
                className="grid gap-3 p-4 lg:grid-cols-[1.2fr_0.65fr_0.65fr_0.65fr_0.65fr_1.2fr_1.1fr_0.95fr]"
              >
                <div>
                  <p className="font-medium text-text">
                    {match
                      ? `${match.homeTeam} vs ${match.awayTeam}`
                      : bet.matchId}
                  </p>
                  <p className="mt-1 text-sm capitalize text-muted">
                    {getPredictionTypeLabel(bet.predictionType)} ·{" "}
                    {getBetPredictionLabel(bet, match)}{" "}
                    · {bet.status === "pending" ? "待结算" : "已结算"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">金额</p>
                  {isEditing ? (
                    <input
                      value={editStake}
                      onChange={(event) => setEditStake(event.target.value)}
                      type="number"
                      min="1"
                      className="mt-1 h-8 w-full rounded-md border border-border bg-panel px-2 text-sm text-text outline-none focus:border-accent"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text">
                      {formatCurrency(bet.stake)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted">赔率</p>
                  <p className="mt-1 text-sm text-text">{bet.odds.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">盈亏</p>
                  <p
                    className={
                      bet.profit >= 0
                        ? "mt-1 text-sm font-semibold text-positive"
                        : "mt-1 text-sm font-semibold text-danger"
                    }
                  >
                    {formatCurrency(bet.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">价值差</p>
                  <p
                    className={
                      bet.valueEdge == null
                        ? "mt-1 text-sm text-muted"
                        : bet.valueEdge > 0
                          ? "mt-1 text-sm font-semibold text-positive"
                          : "mt-1 text-sm font-semibold text-danger"
                    }
                  >
                    {bet.valueEdge == null
                      ? "-"
                      : formatSignedPercent(bet.valueEdge)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">备注</p>
                  {isEditing ? (
                    <textarea
                      value={editNotes}
                      onChange={(event) => setEditNotes(event.target.value)}
                      rows={2}
                      className="mt-1 w-full resize-none rounded-md border border-border bg-panel px-2 py-1 text-sm text-text outline-none focus:border-accent"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-text">{bet.notes}</p>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <select
                      value={editResult}
                      onChange={(event) =>
                        setEditResult(event.target.value as BetResult)
                      }
                      className="h-8 w-full rounded-md border border-border bg-panel px-2 text-sm text-text outline-none focus:border-accent"
                    >
                      <option value="pending">待结算</option>
                      <option value="win">赢</option>
                      <option value="loss">输</option>
                      <option value="void">走水</option>
                    </select>
                  ) : bet.status === "pending" ? (
                    <div className="grid grid-cols-3 gap-2">
                      {(["win", "loss", "void"] as const).map((result) => (
                        <button
                          type="button"
                          key={result}
                          onClick={() => settlePendingBet(bet.id, result)}
                          className="h-8 rounded-md border border-border bg-panel text-xs text-muted transition hover:border-accent hover:text-text"
                        >
                          {result === "win"
                            ? "赢"
                            : result === "loss"
                              ? "输"
                              : "走水"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      {bet.result === "win"
                        ? "赢"
                        : bet.result === "loss"
                          ? "输"
                          : bet.result === "void"
                            ? "走水"
                            : "待结算"}
                    </p>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(bet.id)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-positive/40 bg-positive/10 text-xs text-positive"
                      >
                        <Save size={13} />
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-border bg-panel text-xs text-muted"
                      >
                        <X size={13} />
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(bet)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-border bg-panel text-xs text-muted transition hover:border-accent hover:text-text"
                      >
                        <Pencil size={13} />
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBet(bet.id)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-border bg-panel text-xs text-muted transition hover:border-danger hover:text-danger"
                      >
                        <Trash2 size={13} />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
