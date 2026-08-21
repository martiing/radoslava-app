import { normalizeBulgarianPhone } from "@/lib/validation/phone";

export const REGISTRATION_CONTACT_ERRORS = {
  nameTooShort: "Моля, въведи име, съдържащо поне 2 символа.",
  nameTooLong: "Името е твърде дълго.",
  phoneTooLong: "Телефонният номер е твърде дълъг.",
  phoneInvalid: "Моля, въведи валиден телефонен номер (напр. 0888123456).",
} as const;

export interface RegistrationContactErrors {
  name?: string;
  phone?: string;
}

/**
 * Fast client-side validation for the first registration step.
 *
 * The server schema remains authoritative. This mirrors only the contact
 * checks so a visitor does not complete the whole intake and Turnstile before
 * learning that the phone number or name was invalid.
 */
export function validateRegistrationContact(
  name: string,
  phone: string
): RegistrationContactErrors {
  const errors: RegistrationContactErrors = {};
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (trimmedName.length < 2) {
    errors.name = REGISTRATION_CONTACT_ERRORS.nameTooShort;
  } else if (trimmedName.length > 100) {
    errors.name = REGISTRATION_CONTACT_ERRORS.nameTooLong;
  }

  if (trimmedPhone.length > 30) {
    errors.phone = REGISTRATION_CONTACT_ERRORS.phoneTooLong;
  } else if (!normalizeBulgarianPhone(trimmedPhone)) {
    errors.phone = REGISTRATION_CONTACT_ERRORS.phoneInvalid;
  }

  return errors;
}
