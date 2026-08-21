# Security

This application processes names, email addresses, phone numbers and quiz
answers that can include health-related information. Treat registration, quiz,
admin and database changes as security-sensitive.

## Reporting a vulnerability

Email **radislavova4@gmail.com**. Do not open a public GitHub issue containing
vulnerability details or personal data.

## Secrets and environment variables

See [`.env.example`](.env.example). The most sensitive values are:

- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS; server-only.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public by design and restricted to
  cookie-backed Auth; it never replaces the service-role boundary for data.
- `ADMIN_PASSWORD` — protects the current single-admin login.
- `ADMIN_SESSION_SECRET` — signs 12-hour admin session cookies.
- `QUIZ_SESSION_SECRET` — signs short-lived quiz handoff tokens.
- `RESEND_API_KEY` — sends participant and admin emails.
- `TURNSTILE_SECRET_KEY` — verifies registration challenges.
- `UPSTASH_REDIS_REST_TOKEN` — backs registration and admin-login limits.

Use separate random values for the admin password and both signing secrets.
Never use a `NEXT_PUBLIC_` prefix for a secret. Configure production and preview
environments separately and rotate any value that has appeared in chat, email
or logs.

## Registration protection

The registration path applies, in order:

1. hidden honeypot;
2. form-age validation;
3. server-side Zod validation and length limits;
4. rate limits per IP and normalized email;
5. Cloudflare Turnstile server verification;
6. database constraints, RLS and revoked public grants.

Duplicate emails, honeypots and genuine inserts have the same visible success
shape. Duplicate and honeypot paths receive a signed decoy quiz token, so the
response does not expose an existing participant ID.

Registration rate limiting fails open during an Upstash outage to preserve
availability. Turnstile fails closed in production.

## Quiz protection

The browser never receives a raw participant ID. Registration returns a
six-hour HMAC-signed quiz token. Quiz submission verifies the token and only
updates a participant still in the `registered` stage, making the handoff
single-use. A decoy token follows the ordinary success path without a database
write, preserving duplicate-email privacy.

`QUIZ_SESSION_SECRET` must be configured before the quiz can be used. If it is
missing, registration remains available but the quiz handoff is disabled.

## Admin protection

The admin uses a shared password and a signed, HTTP-only, SameSite=Lax session
cookie. Password comparison is constant-time. Login is limited to five attempts
per IP per 15 minutes when Upstash is available. Every admin Server Action must
call `requireAdmin()` even though `proxy.ts` also gates `/admin/*` routes.

The shared-password model is temporary. Before adding multiple staff members,
move admin identity to individual accounts with MFA and an audit trail.

## Client portal authentication

The client portal uses `@supabase/ssr` with PKCE and cookie-backed sessions.
`proxy.ts` refreshes portal sessions and authorizes protected `/portal/*`
routes with `auth.getClaims()`. Server code never trusts `auth.getSession()` for
authorization.

Participant data remains inaccessible to browser Supabase clients. The public
publishable key is used for Auth only; private records are resolved through the
service-role server client by `auth_user_id`. Existing challenge participants
are not linked by matching an email address alone—the later claim flow must use
a single-use invite token.

Login and password-reset requests are rate-limited when Upstash is available.
Password-reset responses are intentionally generic to prevent account
enumeration. Auth callback redirects are restricted to `/portal` paths and are
marked `private, no-store`.

## Database and retention

Migrations run in this order:

1. `0001_create_leads_table.sql`
2. `0002_rename_leads_to_participants.sql`
3. `0003_create_participant_events.sql`
4. `0004_harden_participants.sql`
5. `0005_retention_and_consent_version.sql`
6. `0006_link_participants_to_auth.sql`
7. `0007_five_question_intake.sql`
8. `0008_normalize_participant_phones.sql`

RLS is enabled with zero public policies and grants are revoked from `anon` and
`authenticated`. Current reads and writes use the server-only Supabase client.

The retention job deletes only old, unconverted participants with no recorded
payment. It deliberately excludes paid/active records. The 12-month interval
must match the approved privacy policy. Enable `pg_cron` before applying
migration `0005`.

Migration `0008` canonicalizes phones to Bulgarian E.164. It intentionally
aborts if legacy values are unrecognized or if multiple rows collapse to the
same number; resolve those records manually before retrying it.

## Logging

Never log names, emails, phone numbers, quiz answers, participant IDs or message
contents. Log stable operation names and sanitized error codes/reasons only.

## Browser security

Static headers live in `next.config.ts`. The nonce-based Content-Security-Policy
and admin route gate are combined in `proxy.ts`. Pages with browser scripts must
render at request time so Next.js can apply the nonce.

Add required third-party origins narrowly. Do not replace the nonce policy with
a broad `unsafe-eval`/wildcard policy in production.

## Deployment checklist

- Configure every variable from `.env.example` in Vercel.
- Configure Supabase Auth redirect URLs and custom SMTP before client invites.
- Use separate Supabase data for preview or enable Deployment Protection.
- Enable MFA on GitHub, Vercel, Supabase, Cloudflare, Upstash and Resend.
- Apply migrations in order and confirm the retention job.
- Complete and legally review the privacy/terms drafts before launch.
- Confirm HSTS is appropriate for every production subdomain before preload.
- Run lint, typecheck, tests, production build and dependency audit.
