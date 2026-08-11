/**
 * Converts a value to an RFC 4180-style quoted CSV cell while preventing
 * spreadsheet applications from evaluating participant-controlled text as a
 * formula.
 *
 * Quoting alone does not stop Excel/LibreOffice formula execution. Prefixing
 * an apostrophe forces text interpretation. Leading whitespace is included in
 * the check because spreadsheet parsers can skip it before evaluating `=`.
 */
export function toSafeCsvValue(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  const startsLikeFormula = /^[=+\-@\t\r\n]/u.test(text) || /^\s+[=+\-@]/u.test(text);

  if (startsLikeFormula) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}
