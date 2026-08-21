/**
 * Reads every row of a query, page by page.
 *
 * PostgREST caps a single response at `db.max_rows`, so a plain `select()`
 * silently returns a prefix of the data. For a list view that is a nuisance;
 * for a CSV export it is a correctness bug that looks like a complete file.
 *
 * Two details matter more than they look:
 *
 *   - The next offset advances by the number of rows actually returned, not by
 *     the requested page size. If the server's cap is lower than the page size,
 *     advancing by the page size would skip everything in between.
 *   - Paging stops on an *empty* page, not on a short one. A short page is the
 *     normal shape of every response when the cap is below the page size, so
 *     treating it as the end would stop after the first page and hand back a
 *     truncated export.
 *
 * The caller must also pass a stable, total ordering. Without one, rows can
 * move between pages as the table changes and the export gains duplicates or
 * loses rows.
 */

export const DEFAULT_PAGE_SIZE = 1000;

/**
 * Ceiling on requests, so a server that keeps returning rows cannot spin here
 * forever. At the default page size this allows 100 000 participants — far
 * past anything this project will see before the export is rewritten.
 */
export const DEFAULT_MAX_PAGES = 100;

export type PageFetcher<TRow> = (
  from: number,
  to: number
) => Promise<{ data: TRow[] | null; error: { code?: string } | null }>;

export type FetchAllResult<TRow> =
  | { ok: true; rows: TRow[] }
  | { ok: false; reason: "query_error" | "too_many_pages"; code?: string };

export async function fetchAllRows<TRow>(
  fetchPage: PageFetcher<TRow>,
  pageSize: number = DEFAULT_PAGE_SIZE,
  maxPages: number = DEFAULT_MAX_PAGES
): Promise<FetchAllResult<TRow>> {
  const rows: TRow[] = [];
  let offset = 0;

  for (let page = 0; page < maxPages; page += 1) {
    const { data, error } = await fetchPage(offset, offset + pageSize - 1);

    if (error) {
      return { ok: false, reason: "query_error", code: error.code };
    }

    const batch = data ?? [];
    if (batch.length === 0) {
      return { ok: true, rows };
    }

    rows.push(...batch);
    offset += batch.length;
  }

  // Deliberately an error rather than the rows collected so far. A partial CSV
  // is indistinguishable from a complete one once it is downloaded.
  return { ok: false, reason: "too_many_pages" };
}
