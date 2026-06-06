import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import type { MealPlan } from "@/lib/meal-plan-schema";

const STYLE = {
  under: {
    bar: "bg-success",
    chip: "bg-success/15 text-success border-success/30",
    Icon: CheckCircle2,
    label: "Comfortably under budget",
  },
  on: {
    bar: "bg-warning",
    chip: "bg-warning/25 text-warning-foreground border-warning/40",
    Icon: Wallet,
    label: "On budget",
  },
  over: {
    bar: "bg-destructive",
    chip: "bg-destructive/15 text-destructive border-destructive/30",
    Icon: AlertTriangle,
    label: "Over budget",
  },
} as const;

export function BudgetBar({ budget }: { budget: MealPlan["budget"] }) {
  const s = STYLE[budget.verdict];
  const pct = Math.min(150, Math.max(2, (budget.estimatedTotal / Math.max(1, budget.userBudget)) * 100));
  const Icon = s.Icon;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${s.chip}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Budget check
            </div>
            <div className="font-display text-2xl font-bold leading-tight">{s.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">${budget.estimatedTotal.toFixed(2)}</span>{" "}
            of ${budget.userBudget.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${s.bar}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      {budget.verdict === "over" && budget.adjustments.length > 0 && (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
            Suggested adjustments
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {budget.adjustments.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
