import { describe, expect, it } from "vitest";
import { getSafePortalRedirect } from "@/lib/client/redirect";

describe("getSafePortalRedirect", () => {
  it("keeps portal paths and query strings", () => {
    expect(getSafePortalRedirect("/portal/plan?week=2")).toBe("/portal/plan?week=2");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(getSafePortalRedirect("https://evil.example/portal")).toBe("/portal");
    expect(getSafePortalRedirect("//evil.example/portal")).toBe("/portal");
  });

  it("rejects non-portal local paths", () => {
    expect(getSafePortalRedirect("/admin")).toBe("/portal");
  });
});
