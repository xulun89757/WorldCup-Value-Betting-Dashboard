"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BankrollMetrics } from "@/types/bankroll";

export function BankrollChart({
  history,
}: {
  history: BankrollMetrics["bankrollHistory"];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={history}>
          <CartesianGrid stroke="#34363a" vertical={false} />
          <XAxis dataKey="label" stroke="#9aa0a6" />
          <YAxis stroke="#9aa0a6" domain={["dataMin - 20", "dataMax + 20"]} />
          <Tooltip
            cursor={{ stroke: "#38bdf8" }}
            contentStyle={{
              background: "#18191b",
              border: "1px solid #34363a",
              borderRadius: 6,
              color: "#f4f4f5",
            }}
          />
          <Area
            type="monotone"
            dataKey="bankroll"
            stroke="#4ade80"
            fill="#4ade8033"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
