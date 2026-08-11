import { describe, expect, it } from "vitest";
import {
  MAX_EMAIL_SUBJECT_LENGTH,
  escapeEmailHtml,
  sanitizeEmailSubject,
  sanitizeEmailTextLine,
} from "@/lib/email/sanitize";

describe("escapeEmailHtml", () => {
  it("escapes all HTML-significant characters", () => {
    expect(escapeEmailHtml(`<tag a="1" b='2'>&`)).toBe(
      "&lt;tag a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;"
    );
  });
});

describe("sanitizeEmailTextLine", () => {
  it("collapses newlines, tabs and control characters into one line", () => {
    expect(sanitizeEmailTextLine("Мария\r\nBcc: victim@example.com\t\u0000край")).toBe(
      "Мария Bcc: victim@example.com край"
    );
  });
});

describe("sanitizeEmailSubject", () => {
  it("removes header line breaks", () => {
    const subject = sanitizeEmailSubject("Нова заявка\r\nBcc: victim@example.com");
    expect(subject).not.toMatch(/[\r\n]/u);
    expect(subject).toBe("Нова заявка Bcc: victim@example.com");
  });

  it("enforces the explicit maximum length", () => {
    expect(sanitizeEmailSubject("а".repeat(MAX_EMAIL_SUBJECT_LENGTH + 20))).toHaveLength(
      MAX_EMAIL_SUBJECT_LENGTH
    );
  });
});
