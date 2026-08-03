import type { MetadataRoute } from "next";

/**
 * Vercel preview deployments get public URLs. Without this they can be crawled
 * and indexed, which puts a working copy of the lead form — pointing at the
 * same database — into search results.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === undefined;

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
