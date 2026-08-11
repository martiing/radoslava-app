/** Allows auth redirects only inside the client portal. */
export function getSafePortalRedirect(value: string | null, fallback = "/portal"): string {
  if (!value || !value.startsWith("/portal") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://local.invalid");
    return parsed.origin === "https://local.invalid" ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}
