import { z } from "zod";
import { normalizeBulgarianPhone } from "@/lib/validation/phone";
import { REGISTRATION_CONTACT_ERRORS } from "@/lib/validation/registration-contact";

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, REGISTRATION_CONTACT_ERRORS.nameTooShort)
    .max(100, REGISTRATION_CONTACT_ERRORS.nameTooLong),
  // No email is collected any more; the phone number is the identity.
  //
  // The raw input is generous about spacing and prefixes, but everything
  // downstream — the unique index, the duplicate check, the rate limiter —
  // sees only the canonical E.164 form produced here. Normalising at the
  // schema boundary means no caller can accidentally skip it.
  phone: z
    .string()
    .trim()
    // Roomy enough for "+359 888 123 456" and similar; the normalised value
    // is always 13 characters.
    .max(30, REGISTRATION_CONTACT_ERRORS.phoneTooLong)
    .transform((value, ctx) => {
      const normalized = normalizeBulgarianPhone(value);

      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: REGISTRATION_CONTACT_ERRORS.phoneInvalid,
        });
        return z.NEVER;
      }

      return normalized;
    }),
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
