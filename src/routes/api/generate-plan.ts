import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import {
  MealPlanSchema,
  PlannerInputSchema,
  type MealPlan,
} from "@/lib/meal-plan-schema";
import { extractJson } from "@/lib/json-extract";

const SHAPE_DOC = `Return ONLY a single JSON object (no markdown fences, no prose) with this exact shape:
{
  "meals": [
    {
      "slot": "breakfast" | "lunch" | "dinner",
      "name": string,
      "description": string,
      "cookTimeMin": number,
      "calories": number,
      "ingredients": [ { "name": string, "quantity": string, "fromPantry": boolean } ],
      "steps": [ string ]
    }
  ],
  "grocery": [ { "name": string, "quantity": string, "aisle": string, "estimatedPrice": number } ],
  "substitutions": [
    { "ingredient": string, "swap": string, "reason": "allergen" | "cheaper" | "pantry" | "dietary", "note": string }
  ],
  "budget": {
    "estimatedTotal": number,
    "userBudget": number,
    "verdict": "under" | "on" | "over",
    "adjustments": [ string ]
  }
}
All listed fields are REQUIRED. Enums must match exactly (lowercase). Exactly 3 meals (breakfast, lunch, dinner). 2-5 substitutions.`;

export const Route = createFileRoute("/api/generate-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const parsed = PlannerInputSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 },
          );
        }
        const input = parsed.data;

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const basePrompt = `You are a practical home-cooking meal planner. Build ONE day's meal plan (breakfast, lunch, dinner) for the user below.

USER:
- Schedule / availability: ${input.schedule}
- Diet: ${input.diet}
- Allergies / restrictions: ${input.allergies || "none"}
- Pantry already on hand: ${input.pantry || "none"}
- Daily food budget (USD): $${input.budget}
- Max cook time per meal: ${input.maxCookTime} minutes
- Cooking skill: ${input.skill}
- Servings: ${input.servings}
${input.calorieTarget ? `- Daily calorie target: ${input.calorieTarget} kcal` : ""}

RULES:
1. Respect all allergies strictly. Never include a restricted ingredient.
2. Prefer pantry items first to reduce cost and waste. Mark fromPantry=true for those.
3. Match the user's skill level and cook-time limit.
4. Grocery list = aggregated ingredients NOT in pantry, grouped with an aisle label (Produce, Dairy, Pantry, Meat & Seafood, Bakery, Frozen, etc.). Provide a realistic USD estimatedPrice for the QUANTITY needed (US grocery rough estimates).
5. Substitutions: include 2-5 useful swaps — at least one for any common allergen risk AND at least one cheaper alternative if the plan is near/over budget. Reason must be one of: allergen, cheaper, pantry, dietary.
6. Budget: sum the grocery estimatedPrice values into estimatedTotal. userBudget = ${input.budget}. verdict = "under" if total < 0.9*budget, "on" if within 0.9-1.1*budget, "over" if > 1.1*budget. If over, give 2-4 concrete adjustment suggestions.
7. Calories per meal should sum near the user's calorie target if provided.
8. Keep steps short (3-6 bullet-style instructions per meal).

${SHAPE_DOC}`;

        async function tryOnce(prompt: string): Promise<{
          ok: true;
          plan: MealPlan;
        } | {
          ok: false;
          rawText: string;
          reason: string;
        }> {
          const { text } = await generateText({ model, prompt });
          let raw: unknown;
          try {
            raw = extractJson(text);
          } catch (e) {
            return {
              ok: false,
              rawText: text,
              reason: e instanceof Error ? e.message : "parse failed",
            };
          }
          const validated = MealPlanSchema.safeParse(raw);
          if (!validated.success) {
            return {
              ok: false,
              rawText: text,
              reason: JSON.stringify(validated.error.issues.slice(0, 5)),
            };
          }
          return { ok: true, plan: validated.data };
        }

        try {
          let attempt = await tryOnce(basePrompt);
          if (!attempt.ok) {
            const retryPrompt = `${basePrompt}\n\nYour previous response could not be used. Reason: ${attempt.reason}\nPrevious response (truncated): ${attempt.rawText.slice(0, 600)}\n\nReturn ONLY the JSON object, matching the shape exactly. No markdown, no commentary.`;
            attempt = await tryOnce(retryPrompt);
          }
          if (!attempt.ok) {
            return Response.json(
              {
                error: "Failed to generate plan",
                detail: `Model output did not match schema. ${attempt.reason}`,
              },
              { status: 502 },
            );
          }
          return Response.json(attempt.plan);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const status = /429/.test(msg)
            ? 429
            : /402/.test(msg)
              ? 402
              : 500;
          return Response.json(
            { error: "Failed to generate plan", detail: msg },
            { status },
          );
        }
      },
    },
  },
});
