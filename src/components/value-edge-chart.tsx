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
import type { getValueOpportunities } from "@/lib/value-edge";

type Opportunity = ReturnType<typeof getValueOpportunities>[number];

export function ValueEdgeChart({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const data = opportunities.map((item) => ({
    name: `${item.match.homeTeam.slice(0, 3)}-${item.match.awayTeam.slice(0, 3)} ${item.label}`,
    edge: Number((item.valueEdge * 100).toFixed(1)),
  }));

  if (data.length === 0) {
    return <p className="text-sm text-muted">暂无正向价值差。</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="#34363a" vertical={false} />
          <XAxis dataKey="name" stroke="#9aa0a6" tick={{ fontSize: 11 }} />
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
          <Bar dataKey="edge" fill="#4ade80" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
