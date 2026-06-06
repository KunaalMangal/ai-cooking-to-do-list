## Problem

`/api/generate-plan` returns 500 with `"No object generated: response did not match schema."` Gemini 3 Flash's structured output (constrained JSON via `Output.object`) is rejecting/failing the `MealPlanSchema` — likely because the model emits a near-miss shape (missing field, wrong enum value, slightly different key) and the AI SDK then refuses to surface a partial object.

## Fix

Stop relying on `experimental_output: Output.object({ schema })` for this call and switch to a two-step pattern that is robust for Gemini:

1. **Prompt for JSON, parse defensively in code.** Use `generateText` with a prompt that includes a concise JSON shape description (slot enum values, reason enum values, required fields) and instructs the model to return ONLY a single JSON object — no markdown, no prose.
2. **Extract + repair JSON** from the raw text using the well-known fallback chain: strip ``` fences → locate first `{`/last `}` → `JSON.parse` → on failure, strip trailing commas/control chars and re-parse.
3. **Validate with the existing Zod `MealPlanSchema`** via `safeParse`. On failure, return a 502 with the Zod issues + a short snippet of the raw text so future debugging is easy (not exposed as user-facing copy).
4. **One automatic retry** with a stricter "fix your previous output to match this shape exactly, return JSON only" follow-up if the first parse/validate fails. Cap at one retry to keep latency/cost bounded.

Keep the schema itself unchanged so the frontend types stay valid.

## Files touched

- `src/routes/api/generate-plan.ts` — swap `Output.object` for `generateText` + JSON extraction helper + Zod validation + single retry.
- `src/lib/json-extract.ts` (new, small) — `extractJson(text: string): unknown` helper (fence strip, brace scan, comma/control repair). Keeps the route file tidy and reusable.

No frontend changes; `MealPlan` type and all components stay the same.

## Validation

- Re-run the failing request (the busy-morning omnivore $25 case) and confirm a valid plan renders.
- Try the `$5/day student` over-budget persona to confirm the `verdict: "over"` + adjustments path still works.
- Confirm error UX: temporarily force a bad model response to verify the 502 path surfaces a clean toast rather than a blank screen.
