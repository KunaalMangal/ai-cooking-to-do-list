import { Clock, Flame, Sunrise, Sun, Moon } from "lucide-react";
import type { MealPlan } from "@/lib/meal-plan-schema";

const ICONS = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
} as const;

export function MealCard({ meal }: { meal: MealPlan["meals"][number] }) {
  const Icon = ICONS[meal.slot];
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {meal.slot}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{meal.cookTimeMin}m</span>
          <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />{meal.calories} kcal</span>
        </div>
      </div>
      <h3 className="font-display text-xl font-bold leading-tight">{meal.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{meal.description}</p>

      <div className="mt-4">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Ingredients
        </div>
        <div className="flex flex-wrap gap-1.5">
          {meal.ingredients.map((ing, i) => (
            <span
              key={i}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                ing.fromPantry
                  ? "border border-accent/30 bg-accent/10 text-accent"
                  : "bg-secondary text-secondary-foreground"
              }`}
              title={ing.fromPantry ? "From your pantry" : ""}
            >
              {ing.quantity} {ing.name}
            </span>
          ))}
        </div>
      </div>

      <ol className="mt-4 space-y-1.5 text-sm text-foreground/85">
        {meal.steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
