"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MatchAnalysis, Selection } from "@/types/match";

const labels: Record<Selection, string> = {
  home: "主胜",
  draw: "平局",
  away: "客胜",
};

export function ProbabilityChart({ analysis }: { analysis: MatchAnalysis }) {
  const data = (["home", "draw", "away"] as Selection[]).map((selection) => ({
    name: labels[selection],
    模型概率: Number((analysis.modelProbabilities[selection] * 100).toFixed(1)),
    市场概率: Number((analysis.marketProbabilities[selection] * 100).toFixed(1)),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="#34363a" vertical={false} />
          <XAxis dataKey="name" stroke="#9aa0a6" />
          <YAxis stroke="#9aa0a6" unit="%" />
          <Tooltip
            cursor={{ fill: "#202124" }}
            contentStyle={{
              background: "#18191b",
              border: "1px solid #34363a",
              borderRadius: 6,
              color: "#f4f4f5",
            }}
          />
          <Bar dataKey="模型概率" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="市场概率" fill="#9aa0a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
