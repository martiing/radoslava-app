/**
 * The browser must fail closed whenever it is not definitely running the
 * local development server. `process.env.NODE_ENV` can be absent from a
 * client bundle when deployment configuration changes after build time; in
 * that case treating the environment as development would unlock a form the
 * production server will reject.
 */
export function isTurnstileRequired(nodeEnv: string | undefined): boolean {
  return nodeEnv !== "development";
}
