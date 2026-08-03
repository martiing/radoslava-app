import { z } from "zod";
import { registrationSchema } from "@/lib/validation/registration-schema";

export const clientEmailSchema = z
  .string()
  .trim()
  .min(1, "Въведи имейл адрес.")
  .max(254, "Имейл адресът е твърде дълъг.")
  .email("Въведи валиден имейл адрес.")
  .transform((value) => value.toLowerCase());

export const clientNewPasswordSchema = z
  .string()
  .min(8, "Паролата трябва да е поне 8 символа.")
  .max(128, "Паролата е твърде дълга.")
  .regex(/[\p{L}]/u, "Паролата трябва да съдържа поне една буква.")
  .regex(/\d/, "Паролата трябва да съдържа поне една цифра.");

export const clientLoginSchema = z.object({
  email: clientEmailSchema,
  password: z.string().min(1, "Въведи парола.").max(128, "Паролата е твърде дълга."),
});

export const clientRegisterSchema = registrationSchema
  .pick({ name: true, phone: true, consent: true })
  .extend({
    email: clientEmailSchema,
    password: clientNewPasswordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Паролите не съвпадат.",
      });
    }
  });

export const clientForgotPasswordSchema = z.object({ email: clientEmailSchema });

export const clientUpdatePasswordSchema = z
  .object({
    password: clientNewPasswordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Паролите не съвпадат.",
      });
    }
  });

export type ClientLoginInput = z.infer<typeof clientLoginSchema>;
export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;
export type ClientAuthField = keyof ClientRegisterInput;
export type ClientAuthFieldErrors = Partial<Record<ClientAuthField, string>>;
