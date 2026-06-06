import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChefHat, Loader2, RotateCcw } from "lucide-react";
import { InputForm } from "@/components/planner/InputForm";
import { MealCard } from "@/components/planner/MealCard";
import { GroceryList } from "@/components/planner/GroceryList";
import { Substitutions } from "@/components/planner/Substitutions";
import { BudgetBar } from "@/components/planner/BudgetBar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import type { MealPlan, PlannerInput } from "@/lib/meal-plan-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlateDay — Your AI cooking plan for today" },
      {
        name: "description",
        content:
          "Tell PlateDay your day, diet, pantry and budget. Get a breakfast, lunch and dinner plan with a grocery list, smart substitutions and a budget verdict.",
      },
      { property: "og:title", content: "PlateDay — AI cooking plan for today" },
      {
        property: "og:description",
        content:
          "A one-day cooking to-do list, grocery list, substitutions and budget check, generated for your day.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});

const STORAGE_KEY = "plateday.plan.v1";

function Index() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastInput, setLastInput] = useState<PlannerInput | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { plan: MealPlan; input: PlannerInput };
        setPlan(parsed.plan);
        setLastInput(parsed.input);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleGenerate(input: PlannerInput) {
    setLoading(true);
    setLastInput(input);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit hit. Please wait a moment and try again.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as MealPlan;
      setPlan(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: data, input }));
      toast.success("Today's plan is ready");
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    if (lastInput) handleGenerate(lastInput);
  }

  return (
    <main className="min-h-screen">
      <Toaster richColors position="top-center" />

      <header className="border-b border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-bold leading-none">PlateDay</div>
              <div className="text-xs text-muted-foreground">Your AI cooking plan</div>
            </div>
          </div>
          <a
            href="https://docs.lovable.dev/features/cloud"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs text-muted-foreground hover:text-foreground sm:block"
          >
            Powered by Lovable AI
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Today, one plate at a time
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl">
          Tell us about your day.
          <br />
          We'll plan dinner.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          PlateDay turns your schedule, pantry and budget into a ready-to-cook breakfast, lunch and
          dinner — with a grocery list, smart swaps and a budget check.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <ClientOnly
          fallback={
            <div className="h-[640px] rounded-3xl border border-border bg-card shadow-[0_10px_40px_-20px_oklch(0.4_0.08_40/0.25)]" />
          }
        >
          <InputForm
            onSubmit={handleGenerate}
            loading={loading}
            initial={lastInput ?? undefined}
          />
        </ClientOnly>
      </section>

      {loading && (
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Cooking up your plan…</span>
        </div>
      )}

      {plan && !loading && (
        <section id="results" className="mx-auto max-w-6xl space-y-10 px-6 pb-24">
          <BudgetBar budget={plan.budget} />

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Today's plate
                </p>
                <h2 className="font-display text-3xl font-bold">Your cooking to-do list</h2>
              </div>
              {lastInput && (
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Regenerate
                </Button>
              )}
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {plan.meals.map((m) => (
                <MealCard key={m.slot} meal={m} />
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <GroceryList items={plan.grocery} />
            </div>
            <div className="lg:col-span-2">
              <Substitutions items={plan.substitutions} />
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Prices and nutrition are AI estimates. Always double-check allergens.
      </footer>
    </main>
  );
}
