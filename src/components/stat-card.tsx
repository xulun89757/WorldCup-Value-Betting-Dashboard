import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "text-accent",
    positive: "text-positive",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        <Icon className={cn("h-4 w-4", toneClass)} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-text">
        {value}
      </p>
    </section>
  );
}
