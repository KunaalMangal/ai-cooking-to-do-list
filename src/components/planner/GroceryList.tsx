import { useMemo, useState } from "react";
import { ShoppingBasket } from "lucide-react";
import type { MealPlan } from "@/lib/meal-plan-schema";

export function GroceryList({ items }: { items: MealPlan["grocery"] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const grouped = useMemo(() => {
    const g: Record<string, { item: MealPlan["grocery"][number]; idx: number }[]> = {};
    items.forEach((item, idx) => {
      const aisle = item.aisle || "Other";
      (g[aisle] ||= []).push({ item, idx });
    });
    return g;
  }, [items]);

  const total = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <ShoppingBasket className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold leading-tight">Grocery list</h3>
            <p className="text-xs text-muted-foreground">{items.length} items · grouped by aisle</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Est. total</div>
          <div className="font-display text-xl font-bold">${total.toFixed(2)}</div>
        </div>
      </header>

      <div className="space-y-4">
        {Object.entries(grouped).map(([aisle, list]) => (
          <div key={aisle}>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {aisle}
            </div>
            <ul className="divide-y divide-border/60">
              {list.map(({ item, idx }) => (
                <li key={idx} className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!checked[idx]}
                    onChange={(e) => setChecked((c) => ({ ...c, [idx]: e.target.checked }))}
                    className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
                  />
                  <div className={`flex-1 ${checked[idx] ? "text-muted-foreground line-through" : ""}`}>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.quantity}</div>
                  </div>
                  <div className="text-sm tabular-nums text-foreground/80">
                    ${item.estimatedPrice.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
