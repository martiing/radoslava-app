const HIGHEST_CONTROL_CHARACTER = 31;
const DELETE_CHARACTER = 127;

export const MAX_EMAIL_SUBJECT_LENGTH = 150;

/** Escapes a value before it is interpolated into HTML text or an attribute. */
export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Reduces participant-controlled text to one display line for plain-text
 * email fields. Newlines and other control characters become spaces so a
 * name cannot manufacture extra headers or fake rows in the message body.
 */
export function sanitizeEmailTextLine(value: string): string {
  let cleaned = "";

  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code > HIGHEST_CONTROL_CHARACTER && code !== DELETE_CHARACTER) {
      cleaned += character;
    } else {
      cleaned += " ";
    }
  }

  return cleaned.replace(/\s+/gu, " ").trim();
}

/**
 * Subjects are single-line protocol fields, not free-form message bodies.
 * Keep them bounded and strip every route for CR/LF or control injection.
 */
export function sanitizeEmailSubject(value: string): string {
  return sanitizeEmailTextLine(value).slice(0, MAX_EMAIL_SUBJECT_LENGTH).trim();
}
