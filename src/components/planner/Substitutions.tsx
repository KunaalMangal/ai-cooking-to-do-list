import { ArrowRight, Repeat } from "lucide-react";
import type { MealPlan } from "@/lib/meal-plan-schema";

const REASON_STYLE: Record<string, string> = {
  allergen: "bg-destructive/10 text-destructive border-destructive/30",
  cheaper: "bg-success/15 text-success border-success/30",
  pantry: "bg-accent/15 text-accent border-accent/30",
  dietary: "bg-warning/20 text-warning-foreground border-warning/40",
};

export function Substitutions({ items }: { items: MealPlan["substitutions"] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Repeat className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold leading-tight">Smart substitutions</h3>
          <p className="text-xs text-muted-foreground">Allergen-safe & budget-friendly swaps</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No swaps needed — you're set.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s, i) => (
            <li key={i} className="rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-foreground/80">{s.ingredient}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-primary">{s.swap}</span>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${REASON_STYLE[s.reason] ?? ""}`}>
                  {s.reason}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
