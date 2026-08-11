import "server-only";

/**
 * Reduces an unknown failure to the parts that are safe to write to a log.
 *
 * Used on the public registration path, where an error can have travelled
 * through a database driver, an HTTP client or an email provider — any of
 * which is free to quote the offending input back inside `error.message`. The
 * input on that path is a participant's name, phone number and intake
 * answers, so the message is excluded outright rather than filtered.
 *
 * What survives is the class of failure: enough to tell one incident from
 * another, not enough to reconstruct who it happened to.
 */

/** Long enough for real provider codes, short enough to bound a log line. */
const MAX_FIELD_LENGTH = 64;

const HIGHEST_CONTROL_CHARACTER = 31;
const DELETE_CHARACTER = 127;

/**
 * Drops control characters, newlines included.
 *
 * Written as a scan rather than a regex on purpose: an escape sequence in a
 * character class is easy to mangle in review or in tooling, and getting it
 * subtly wrong here would silently reopen the hole it exists to close.
 */
function stripControlCharacters(value: string): string {
  let cleaned = "";

  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code > HIGHEST_CONTROL_CHARACTER && code !== DELETE_CHARACTER) {
      cleaned += character;
    }
  }

  return cleaned;
}

/**
 * Codes and statuses are usually short machine tokens, but nothing guarantees
 * it — a provider can put a whole sentence there. Strip anything that could
 * break out of the line, then cap the length.
 */
function safeField(value: string | number): string | number {
  if (typeof value === "number") {
    return value;
  }

  return stripControlCharacters(value).trim().slice(0, MAX_FIELD_LENGTH);
}

export function describeError(error: unknown): Record<string, string | number> {
  const described: Record<string, string | number> = {
    name: error instanceof Error ? safeField(error.name) : typeof error,
  };

  if (error && typeof error === "object") {
    const candidate = error as { status?: unknown; statusCode?: unknown; code?: unknown };
    const status = candidate.status ?? candidate.statusCode;

    if (typeof status === "number" || typeof status === "string") {
      described.status = safeField(status);
    }
    if (typeof candidate.code === "string" || typeof candidate.code === "number") {
      described.code = safeField(candidate.code);
    }
  }

  return described;
}
