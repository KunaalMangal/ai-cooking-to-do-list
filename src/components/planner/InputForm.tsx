import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlannerInput } from "@/lib/meal-plan-schema";

const DEFAULTS: PlannerInput = {
  schedule: "Busy morning meetings, free after 6pm",
  diet: "omnivore",
  allergies: "",
  pantry: "eggs, rice, olive oil, onion, garlic",
  budget: 25,
  maxCookTime: 30,
  skill: "intermediate",
  servings: 2,
};

const PERSONAS: { label: string; values: Partial<PlannerInput> }[] = [
  {
    label: "Busy professional",
    values: {
      schedule: "Back-to-back meetings until 6pm, quick dinner needed",
      diet: "mediterranean",
      pantry: "olive oil, garlic, lemon, pasta",
      budget: 30,
      maxCookTime: 20,
      skill: "intermediate",
      servings: 1,
    },
  },
  {
    label: "Parent + kids",
    values: {
      schedule: "Morning school run, afternoon free, family dinner at 6:30",
      diet: "omnivore",
      allergies: "peanuts",
      pantry: "pasta, butter, cheddar, frozen peas",
      budget: 40,
      maxCookTime: 35,
      skill: "intermediate",
      servings: 4,
    },
  },
  {
    label: "Student, $5/day",
    values: {
      schedule: "Classes morning and afternoon, cook in the evening",
      diet: "omnivore",
      pantry: "rice, beans, salt, oil",
      budget: 5,
      maxCookTime: 15,
      skill: "beginner",
      servings: 1,
    },
  },
];

export function InputForm({
  onSubmit,
  loading,
  initial,
}: {
  onSubmit: (input: PlannerInput) => void;
  loading: boolean;
  initial?: PlannerInput;
}) {
  const [v, setV] = useState<PlannerInput>(initial ?? DEFAULTS);

  function update<K extends keyof PlannerInput>(key: K, value: PlannerInput[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(v);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-6 shadow-[0_10px_40px_-20px_oklch(0.4_0.08_40/0.25)] sm:p-8"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Try a persona:</span>
        {PERSONAS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setV((prev) => ({ ...prev, ...p.values }))}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="schedule">Your day</Label>
          <Textarea
            id="schedule"
            value={v.schedule}
            onChange={(e) => update("schedule", e.target.value)}
            rows={2}
            placeholder="e.g. busy morning meetings, free after 6pm"
            required
          />
        </div>

        <div>
          <Label htmlFor="diet">Diet</Label>
          <Select value={v.diet} onValueChange={(val) => update("diet", val)}>
            <SelectTrigger id="diet"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["omnivore", "vegetarian", "vegan", "pescatarian", "keto", "mediterranean", "gluten-free"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="skill">Cooking skill</Label>
          <Select value={v.skill} onValueChange={(val) => update("skill", val as PlannerInput["skill"])}>
            <SelectTrigger id="skill"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="allergies">Allergies / restrictions</Label>
          <Input
            id="allergies"
            value={v.allergies ?? ""}
            onChange={(e) => update("allergies", e.target.value)}
            placeholder="e.g. peanuts, shellfish"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="pantry">Already in your pantry</Label>
          <Textarea
            id="pantry"
            value={v.pantry ?? ""}
            onChange={(e) => update("pantry", e.target.value)}
            rows={2}
            placeholder="comma-separated: eggs, rice, olive oil…"
          />
        </div>

        <div>
          <Label htmlFor="budget">Daily budget (USD)</Label>
          <Input
            id="budget"
            type="number"
            min={1}
            max={1000}
            value={v.budget}
            onChange={(e) => update("budget", Number(e.target.value))}
            required
          />
        </div>

        <div>
          <Label htmlFor="time">Max cook time / meal (min)</Label>
          <Input
            id="time"
            type="number"
            min={5}
            max={180}
            value={v.maxCookTime}
            onChange={(e) => update("maxCookTime", Number(e.target.value))}
            required
          />
        </div>

        <div>
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            type="number"
            min={1}
            max={20}
            value={v.servings}
            onChange={(e) => update("servings", Number(e.target.value))}
            required
          />
        </div>

        <div>
          <Label htmlFor="cal">Calorie target / day (optional)</Label>
          <Input
            id="cal"
            type="number"
            min={0}
            max={10000}
            value={v.calorieTarget ?? ""}
            onChange={(e) =>
              update(
                "calorieTarget",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="e.g. 2000"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg" disabled={loading} className="gap-2">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate today's plan</>
          )}
        </Button>
      </div>
    </form>
  );
}
