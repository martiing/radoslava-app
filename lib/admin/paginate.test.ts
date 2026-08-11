import { describe, expect, it, vi } from "vitest";
import { fetchAllRows, type PageFetcher } from "@/lib/admin/paginate";

interface Row {
  id: number;
}

/**
 * Stands in for PostgREST: serves `rows` in slices, never returning more than
 * `serverCap` at a time regardless of how many were asked for.
 */
function fakeServer(rows: Row[], serverCap = Number.POSITIVE_INFINITY) {
  const calls: Array<{ from: number; to: number }> = [];

  const fetchPage: PageFetcher<Row> = async (from, to) => {
    calls.push({ from, to });
    const requested = to - from + 1;
    const size = Math.min(requested, serverCap);
    return { data: rows.slice(from, from + size), error: null };
  };

  return { fetchPage, calls };
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: index }));
}

describe("fetchAllRows", () => {
  it("returns everything from a single short page", async () => {
    const { fetchPage } = fakeServer(makeRows(3));
    const result = await fetchAllRows(fetchPage, 1000);

    expect(result).toEqual({ ok: true, rows: makeRows(3) });
  });

  it("returns an empty list when there is nothing to export", async () => {
    const { fetchPage, calls } = fakeServer([]);
    const result = await fetchAllRows(fetchPage, 1000);

    expect(result).toEqual({ ok: true, rows: [] });
    expect(calls).toHaveLength(1);
  });

  it("walks several full pages and stops on the empty one", async () => {
    const { fetchPage, calls } = fakeServer(makeRows(25));
    const result = await fetchAllRows(fetchPage, 10);

    expect(result.ok && result.rows).toHaveLength(25);
    // 10 + 10 + 5, then one more request that comes back empty.
    expect(calls).toEqual([
      { from: 0, to: 9 },
      { from: 10, to: 19 },
      { from: 20, to: 29 },
      { from: 25, to: 34 },
    ]);
  });

  it("ends after a last page that exactly fills the page size", async () => {
    const { fetchPage } = fakeServer(makeRows(20));
    const result = await fetchAllRows(fetchPage, 10);

    expect(result.ok && result.rows).toHaveLength(20);
  });

  // The case a "stop when the page is short" implementation gets wrong: every
  // page is short, because the server caps below the requested size.
  it("keeps paging when the server caps below the requested page size", async () => {
    const { fetchPage, calls } = fakeServer(makeRows(7), 2);
    const result = await fetchAllRows(fetchPage, 1000);

    expect(result.ok && result.rows).toHaveLength(7);
    expect(calls.map((call) => call.from)).toEqual([0, 2, 4, 6, 7]);
  });

  it("advances the offset by the rows actually returned", async () => {
    const { fetchPage, calls } = fakeServer(makeRows(5), 3);
    await fetchAllRows(fetchPage, 1000);

    // Not 0, 1000, 2000 — the offsets follow real progress.
    expect(calls.map((call) => call.from)).toEqual([0, 3, 5]);
  });

  it("reports a query error instead of a partial result", async () => {
    const fetchPage = vi
      .fn<PageFetcher<Row>>()
      .mockResolvedValueOnce({ data: makeRows(10), error: null })
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST103" } });

    const result = await fetchAllRows(fetchPage, 10);

    expect(result).toEqual({ ok: false, reason: "query_error", code: "PGRST103" });
  });

  // A truncated CSV looks exactly like a complete one after download, so the
  // guard must fail loudly rather than hand back what it collected.
  it("fails when the page guard is exhausted, returning no rows", async () => {
    const { fetchPage } = fakeServer(makeRows(1000));
    const result = await fetchAllRows(fetchPage, 10, 3);

    expect(result).toEqual({ ok: false, reason: "too_many_pages" });
  });

  it("stops requesting once the guard is reached", async () => {
    const { fetchPage, calls } = fakeServer(makeRows(1000));
    await fetchAllRows(fetchPage, 10, 3);

    expect(calls).toHaveLength(3);
  });
});
