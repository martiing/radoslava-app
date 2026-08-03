import { z } from "zod";

const bulgarianPhonePattern = /^(\+359|0)\d{9}$/;

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Моля, въведи име, съдържащо поне 2 символа.")
    .max(100, "Името е твърде дълго."),
  email: z
    .string()
    .trim()
    .min(1, "Моля, въведи имейл адрес.")
    // RFC 5321 caps an address at 254 characters; without this an attacker can
    // push arbitrarily long strings straight into the database.
    .max(254, "Имейл адресът е твърде дълъг.")
    .email("Моля, въведи валиден имейл адрес."),
  phone: z
    .string()
    .trim()
    .max(20, "Телефонният номер е твърде дълъг.")
    .regex(bulgarianPhonePattern, "Моля, въведи валиден телефонен номер (напр. 0888123456)."),
  consent: z.literal("on", {
    message: "Трябва да се съгласиш с политиката за поверителност.",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationFieldErrors = Partial<Record<keyof RegistrationInput, string>>;
