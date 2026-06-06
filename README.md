# PlateDay

An AI-powered micro-app that turns your schedule, diet, pantry and budget into a complete one-day cooking plan — breakfast, lunch and dinner — with a grocery list, smart substitutions and a budget feasibility check.

## What it does

1. **Tell us about your day** — schedule, dietary preferences, allergies, what’s in your pantry, budget, cooking skill and servings.
2. **Get a structured plan** — three meals with ingredients, steps, cook time and calorie estimates.
3. **Shop smarter** — a grocery list sorted by aisle with estimated prices.
4. **Swap on the fly** — AI suggests substitutions for allergens, cheaper alternatives, pantry items or dietary needs.
5. **Stay on budget** — a budget bar shows whether the plan is under, on or over your target, plus suggested adjustments.

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) v1 (full-stack React 19, SSR/SSG)
- **Bundler:** Vite 7
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Package manager:** Bun
- **AI:** Lovable AI Gateway via the AI SDK (`@ai-sdk/openai-compatible`)
- **Validation:** Zod
- **UI primitives:** Radix UI + shadcn/ui components
- **Icons:** Lucide React
- **Notifications:** Sonner

## Prerequisites

- [Bun](https://bun.sh) 1.2+
- A Lovable API key (for AI plan generation)

## Quick start

```bash
# Install dependencies
bun install

# Add your Lovable API key
# Create a .env file with:
#   LOVABLE_API_KEY=your_key_here

# Run the dev server
bun run dev
```

Open `http://localhost:3000`.

## Available scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the Vite dev server (hot reload) |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## Project structure

```
src/
  routes/
    index.tsx              # Home page — planner UI & results
    api/
      generate-plan.ts     # Server route: POST /api/generate-plan
  components/
    planner/
      InputForm.tsx        # User input form
      MealCard.tsx         # Individual meal display
      GroceryList.tsx      # Grocery list panel
      Substitutions.tsx    # Substitution suggestions
      BudgetBar.tsx        # Budget summary bar
    ui/                    # shadcn/ui base components
  lib/
    meal-plan-schema.ts    # Zod schemas for input & output
    json-extract.ts        # JSON extraction & repair helper
    ai-gateway.server.ts  # Lovable AI Gateway provider setup
  styles.css               # Tailwind v4 imports & design tokens
```

## Environment variables

Create a `.env` file in the project root:

```
LOVABLE_API_KEY=lovable_...
```

No other variables are required for local development.

## How plan generation works

1. The user submits their preferences via `InputForm`.
2. The frontend POSTs to `/api/generate-plan`.
3. The server sends a structured prompt to the Lovable AI Gateway.
4. The response is extracted, repaired if needed, and validated against `MealPlanSchema`.
5. If validation fails once, the server asks the model to fix the output and retries.
6. The validated plan is returned and cached in `localStorage`.

## License

MIT
