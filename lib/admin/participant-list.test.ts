import { describe, expect, it } from "vitest";
import {
  MAX_PARTICIPANT_SEARCH_LENGTH,
  filterParticipantsByQuery,
  parseParticipantListFilters,
} from "@/lib/admin/participant-list";

const participants = [
  { name: "Мария Иванова", email: "maria@example.com", phone: "+359888111222" },
  { name: "Елена Петрова", email: null, phone: "+359899333444" },
];

describe("parseParticipantListFilters", () => {
  it("accepts a real stage and trims the search query", () => {
    expect(parseParticipantListFilters("paid", "  Мария  ")).toEqual({
      ok: true,
      filters: { stage: "paid", query: "Мария" },
    });
  });

  it("rejects a stage outside the catalog", () => {
    expect(parseParticipantListFilters("owner", "").ok).toBe(false);
  });

  it("rejects repeated URL parameters", () => {
    expect(parseParticipantListFilters(["paid", "completed"], "").ok).toBe(false);
    expect(parseParticipantListFilters(undefined, ["one", "two"]).ok).toBe(false);
  });

  it("rejects a search query above the explicit limit", () => {
    expect(
      parseParticipantListFilters(undefined, "a".repeat(MAX_PARTICIPANT_SEARCH_LENGTH + 1)).ok
    ).toBe(false);
  });
});

describe("filterParticipantsByQuery", () => {
  it("matches Bulgarian names case-insensitively", () => {
    expect(filterParticipantsByQuery(participants, "мАРИЯ")).toEqual([participants[0]]);
  });

  it("matches email and canonical phone", () => {
    expect(filterParticipantsByQuery(participants, "example.com")).toEqual([participants[0]]);
    expect(filterParticipantsByQuery(participants, "899333")).toEqual([participants[1]]);
  });

  it("treats PostgREST punctuation as literal text, not filter syntax", () => {
    expect(filterParticipantsByQuery(participants, "*),stage.eq.paid")).toEqual([]);
  });

  it("returns all rows for an empty query", () => {
    expect(filterParticipantsByQuery(participants, "")).toEqual(participants);
  });
});
