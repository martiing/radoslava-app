# Security

This site collects real personal data — name, email and phone number of people
signing up for the challenge. Treat every change to the registration path as a
change that can affect real people.

## Reporting a vulnerability

Email **hello@radoslava.fit** with the details. Please do not open a public
GitHub issue for a security problem.

## Required environment variables

The app depends on four security-relevant secrets beyond Supabase. See
[`.env.example`](.env.example) for the full list.

| Variable | Missing in production means |
|---|---|
| `TURNSTILE_SECRET_KEY` | **Every submission is rejected.** Fail-closed by design. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No challenge is rendered, so no token is produced. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Form still works, but **without rate limiting**. |

Set all of them for **both** the production and preview environments in Vercel
before deploying.

`SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security completely. It must
never carry a `NEXT_PUBLIC_` prefix and must never be committed.

## How the registration form is protected

Requests pass through these gates in order, cheapest first:

1. **Honeypot** — a hidden `company` field. Filled in means bot; answers with the
   ordinary success message so the bot learns nothing.
2. **Form age** — rejects submissions faster than 2 seconds or older than 6 hours.
   A cheap filter only; the value comes from the client.
3. **Schema validation** — `zod`, server-side, with length caps.
4. **Rate limiting** — 5 per 10 minutes per IP, 3 per 24 hours per email.
   Identifiers are SHA-256 hashed before they reach Redis.
5. **Turnstile** — Cloudflare's server-side `siteverify`.
6. **Database** — RLS with zero policies, plus length constraints.

Two deliberate choices worth knowing about:

- **A duplicate email returns the ordinary success message**, not "this email is
  already registered". The latter would let anyone test whether a given person
  signed up. If you ever change this, you reopen that hole.
- **Rate limiting fails open** if Upstash is unreachable, so a Redis outage does
  not take the form offline. **Turnstile fails closed** — a missing secret or a
  Cloudflare error rejects the submission.

## There is no login

This app has no authentication: no accounts, no sessions, no admin panel, no
password field anywhere. There is nothing to brute-force here, and therefore no
login rate limiting to configure.

The only credentials that matter are the ones guarding the dashboards —
Supabase, Vercel and GitHub. Those are third-party logins, so **MFA on all three
accounts is the control**, not anything in this repo.

If a login is ever added to this project, it needs its own attempt limiting,
lockout and audit trail. None of the protections described above cover that
case.

## Retention

`supabase/migrations/0003_retention_and_consent_version.sql` schedules a daily
`pg_cron` job that deletes leads older than the retention period. **That
interval and the period stated in the privacy policy must match.** Every lead
also stores `consent_policy_version`, so you can show which version of the
policy a person agreed to.

## Logging

Server logs must never contain names, emails or phone numbers. The existing
`console.error` calls log error codes only — keep it that way when adding
new ones.

## Content-Security-Policy

The CSP lives in [`middleware.ts`](middleware.ts) and uses a per-request nonce.
If you add a third-party script, add its origin there rather than weakening
`script-src`. `style-src` keeps `'unsafe-inline'` because Tailwind v4 requires
it — this is a known, accepted relaxation.
