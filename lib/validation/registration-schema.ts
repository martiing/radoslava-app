import { z } from "zod";

const bulgarianPhonePattern = /^(\+359|0)\d{9}$/;

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Моля, въведи име, съдържащо поне 2 символа.")
    .max(100, "Името е твърде дълго."),
  email: z.string().trim().min(1, "Моля, въведи имейл адрес.").email("Моля, въведи валиден имейл адрес."),
  phone: z
    .string()
    .trim()
    .regex(bulgarianPhonePattern, "Моля, въведи валиден телефонен номер (напр. 0888123456)."),
  consent: z.literal("on", {
    message: "Трябва да се съгласиш с политиката за поверителност.",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationFieldErrors = Partial<Record<keyof RegistrationInput, string>>;
