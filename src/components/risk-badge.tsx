import type { RiskLevel } from "@/types/match";
import { cn } from "@/lib/utils";

export function RiskBadge({ level }: { level: RiskLevel }) {
  const className = {
    low: "border-positive/40 bg-positive/10 text-positive",
    medium: "border-warning/40 bg-warning/10 text-warning",
    high: "border-danger/40 bg-danger/10 text-danger",
  }[level];

  const label = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
  }[level];

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium capitalize",
        className,
      )}
    >
      {label}
    </span>
  );
}
