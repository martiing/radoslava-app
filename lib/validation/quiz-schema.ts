import { z } from "zod";

const weightSchema = z.coerce
  .number({ message: "Моля, въведи число." })
  .min(30, "Моля, въведи реалистично тегло.")
  .max(250, "Моля, въведи реалистично тегло.");

export const quizSchema = z
  .object({
    participantId: z.string().trim().uuid("Невалидна заявка. Моля, презареди страницата."),
    goal: z.enum(["weight_loss", "tone_and_shape", "strength", "energy_habits", "general_health"], {
      message: "Моля, избери основната си цел.",
    }),
    currentWeightKg: weightSchema.optional(),
    targetWeightKg: weightSchema.optional(),
    activityLevel: z.coerce
      .number({ message: "Моля, избери стойност." })
      .int()
      .min(1, "Моля, избери стойност между 1 и 5.")
      .max(5, "Моля, избери стойност между 1 и 5."),
    weeklyCommitment: z.coerce
      .number({ message: "Моля, избери стойност." })
      .int()
      .min(1, "Моля, избери стойност между 1 и 5.")
      .max(5, "Моля, избери стойност между 1 и 5."),
    primaryFocus: z.enum(["nutrition", "training", "accountability", "mindset"], {
      message: "Моля, избери къде имаш най-голяма нужда от помощ.",
    }),
    hasLimitations: z.enum(["yes", "no"], {
      message: "Моля, избери отговор.",
    }),
    limitationsNote: z.string().trim().max(500, "Моля, съкрати текста.").optional(),
    expectations: z
      .string()
      .trim()
      .min(1, "Моля, сподели какво очакваш.")
      .max(1000, "Моля, съкрати текста."),
    extraNotes: z.string().trim().max(1000, "Моля, съкрати текста.").optional(),
  })
  .refine(
    (data) => data.goal !== "weight_loss" || (data.currentWeightKg !== undefined && data.targetWeightKg !== undefined),
    {
      message: "Моля, въведи текущо и целево тегло.",
      path: ["currentWeightKg"],
    }
  )
  .refine((data) => data.hasLimitations !== "yes" || Boolean(data.limitationsNote?.length), {
    message: "Моля, разкажи ни накратко.",
    path: ["limitationsNote"],
  });

export type QuizFormInput = z.infer<typeof quizSchema>;

export type QuizFieldErrors = Partial<Record<keyof QuizFormInput, string>>;
