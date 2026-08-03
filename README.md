# Radoslava Fitness

Next.js application for the Radoslava fitness challenge: landing page,
registration, quiz, personalized email and participant administration.

## Stack

- Next.js 16, React 19, TypeScript and Tailwind CSS 4
- Supabase Postgres through a server-only client
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

- Supabase URL and server secret
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
npm audit --omit=dev --audit-level=critical
```

CI runs the same checks on pushes to `main` and pull requests.

## Database

Apply the SQL files under `supabase/migrations` in numeric order. Migration
`0005` uses `pg_cron`; enable the extension in Supabase first and verify that
the retention interval matches the approved privacy policy.

## Before production

- complete and legally review the privacy and terms drafts;
- replace demonstration testimonials/content with verified material;
- verify the production domain and Resend sender;
- separate preview and production data;
- configure all environment variables;
- apply migrations and inspect the retention job;
- smoke-test registration → quiz → email → admin end to end.
