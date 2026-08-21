# Radoslava Fitness

Next.js application for the Radoslava fitness challenge and its client portal:
landing page, registration, quiz, personalized email, participant
administration and Supabase Auth accounts.

## Stack

- Next.js 16, React 19, TypeScript and Tailwind CSS 4
- Supabase Postgres through a server-only client and Supabase SSR Auth
- Resend for transactional email
- Cloudflare Turnstile and Upstash Redis for abuse protection

## Local setup

Requires Node.js 22.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Populate `.env.local` before testing real
registration, quiz email or admin flows. Never commit `.env.local`.

## Required configuration

The full list and comments are in [`.env.example`](.env.example):

- public Supabase URL/publishable key and server-only service-role key
- canonical site URL for Auth confirmation/password-reset redirects
- admin password and admin-session signing secret
- quiz-session signing secret
- Resend API key and sender/notification addresses
- Turnstile site/secret keys
- Upstash Redis REST URL/token

Turnstile is fail-closed in production. Configure the security variables in
Vercel before deploying this branch. See [SECURITY.md](SECURITY.md).

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

CI runs the same checks on pushes to `main` and pull requests.

## Database

Apply the SQL files under `supabase/migrations` in numeric order. Migration
`0005` uses `pg_cron`; enable the extension in Supabase first and verify that
the retention interval matches the approved privacy policy. Migration `0006`
links client accounts to participants; it is intentionally nullable until the
legacy invite/claim flow is shipped.

Migration `0008` normalizes participant phones to Bulgarian E.164 and aborts
without changing data if it finds an invalid legacy value or a canonical
duplicate. Resolve those rows manually, then rerun the migration.

## Supabase Auth setup

Before enabling `/portal` in production:

1. enable Email + Password in Supabase Auth;
2. add the production origin and `/auth/callback` to the allowed redirect URLs;
3. set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and
   `NEXT_PUBLIC_SITE_URL` in Vercel;
4. configure custom SMTP through Resend before inviting real clients;
5. apply migration `0006_link_participants_to_auth.sql`.

Existing challenge participants are never linked to an Auth account by matching
email alone. They remain unlinked until the single-use claim flow is added.

## Before production

- complete and legally review the privacy and terms drafts;
- replace demonstration testimonials/content with verified material;
- verify the production domain and Resend sender;
- separate preview and production data;
- configure all environment variables;
- apply migrations and inspect the retention job;
- smoke-test registration → quiz → email → admin end to end;
- smoke-test portal sign-up → email confirmation → login → password reset.
