import { z } from "zod";

export const PlannerInputSchema = z.object({
  schedule: z.string().min(1).max(500),
  diet: z.string().min(1).max(50),
  allergies: z.string().max(300).optional().default(""),
  pantry: z.string().max(500).optional().default(""),
  budget: z.number().min(1).max(1000),
  maxCookTime: z.number().min(5).max(180),
  skill: z.enum(["beginner", "intermediate", "advanced"]),
  servings: z.number().min(1).max(20),
  calorieTarget: z.number().min(0).max(10000).optional(),
});
export type PlannerInput = z.infer<typeof PlannerInputSchema>;

export const MealPlanSchema = z.object({
  meals: z.array(
    z.object({
      slot: z.enum(["breakfast", "lunch", "dinner"]),
      name: z.string(),
      description: z.string(),
      cookTimeMin: z.number(),
      calories: z.number(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          quantity: z.string(),
          fromPantry: z.boolean(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  ),
  grocery: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      aisle: z.string(),
      estimatedPrice: z.number(),
    }),
  ),
  substitutions: z.array(
    z.object({
      ingredient: z.string(),
      swap: z.string(),
      reason: z.enum(["allergen", "cheaper", "pantry", "dietary"]),
      note: z.string(),
    }),
  ),
  budget: z.object({
    estimatedTotal: z.number(),
    userBudget: z.number(),
    verdict: z.enum(["under", "on", "over"]),
    adjustments: z.array(z.string()),
  }),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;
