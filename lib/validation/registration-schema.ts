import { z } from "zod";

const bulgarianPhonePattern = /^(\+359|0)\d{9}$/;

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Моля, въведи име, съдържащо поне 2 символа.")
    .max(100, "Името е твърде дълго."),
  phone: z
    .string()
    .trim()
    .regex(bulgarianPhonePattern, "Моля, въведи валиден телефонен номер (напр. 0888123456)."),
  primaryGoal: z.enum(["weight_loss", "tone_and_shape", "muscle_gain", "general_health"], {
    message: "Моля, избери основната си цел.",
  }),
  trainingTrack: z.enum(["gym", "home", "both"], {
    message: "Моля, избери къде ще тренираш.",
  }),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Моля, избери нивото си на опит.",
  }),
  consent: z.literal("on", {
    message: "Трябва да се съгласиш с политиката за поверителност.",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationFieldErrors = Partial<Record<keyof RegistrationInput, string>>;
