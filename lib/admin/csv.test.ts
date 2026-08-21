import { describe, expect, it } from "vitest";
import { toSafeCsvValue } from "@/lib/admin/csv";

describe("toSafeCsvValue", () => {
  it("quotes values and doubles embedded quotes", () => {
    expect(toSafeCsvValue('Мария "Мими"')).toBe('"Мария ""Мими"""');
  });

  it.each(["=1+1", "+cmd", "-2+3", "@SUM(A1:A2)"])(
    "neutralizes a direct spreadsheet formula prefix: %s",
    (value) => {
      expect(toSafeCsvValue(value)).toBe(`"'${value}"`);
    }
  );

  it.each(["  =1+1", "\t=1+1", "\r=1+1", "\n=1+1"])(
    "neutralizes a formula hidden behind whitespace: %j",
    (value) => {
      expect(toSafeCsvValue(value)).toBe(`"'${value}"`);
    }
  );

  it("preserves ordinary text and empty values", () => {
    expect(toSafeCsvValue("Мария")).toBe('"Мария"');
    expect(toSafeCsvValue(null)).toBe('""');
  });
});
