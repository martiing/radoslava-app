/**
 * Bulgarian phone numbers, reduced to one canonical form.
 *
 * The phone number is the participant's identity: it is the unique key in the
 * database, the deduplication key, and the rate-limiting key. All three break
 * if the same number can be stored two ways, so every path must agree on
 * exactly one spelling.
 *
 * Canonical form is E.164 — `+359` followed by nine digits.
 *
 * Accepted inputs, all collapsing to the same output:
 *   0888123456       0888 123 456      0888-123-456
 *   +359888123456    +359 888 123 456
 *   00359888123456
 */

const SEPARATORS = /[\s\-().]/g;

/** National form: a leading zero standing in for the country code. */
const NATIONAL = /^0(\d{9})$/;
/** International forms, with either the + or the 00 prefix. */
const INTERNATIONAL_PLUS = /^\+359(\d{9})$/;
const INTERNATIONAL_ZEROS = /^00359(\d{9})$/;

/**
 * Returns the number in canonical E.164 form, or null when it is not a
 * recognisable Bulgarian number.
 *
 * Returning null rather than throwing keeps this usable directly inside a zod
 * refinement, where an invalid value is an expected outcome and not an error.
 */
export function normalizeBulgarianPhone(input: string): string | null {
  const compact = input.trim().replace(SEPARATORS, "");

  for (const pattern of [NATIONAL, INTERNATIONAL_PLUS, INTERNATIONAL_ZEROS]) {
    const match = compact.match(pattern);
    if (match) {
      return `+359${match[1]}`;
    }
  }

  return null;
}

/** True when the value is already in canonical form. */
export function isCanonicalBulgarianPhone(value: string): boolean {
  return INTERNATIONAL_PLUS.test(value);
}
