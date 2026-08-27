import { describe, expect, it } from "vitest";
import { isTurnstileRequired } from "@/lib/security/turnstile-config";

describe("isTurnstileRequired", () => {
  it("allows local development without Cloudflare credentials", () => {
    expect(isTurnstileRequired("development")).toBe(false);
  });

  it.each(["production", "test"])("fails closed in %s", (nodeEnv) => {
    expect(isTurnstileRequired(nodeEnv)).toBe(true);
  });

  it("fails closed when the client bundle does not expose NODE_ENV", () => {
    expect(isTurnstileRequired(undefined)).toBe(true);
  });
});
