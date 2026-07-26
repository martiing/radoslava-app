-- Leads captured from the "Едномесечно предизвикателство с Радослава" landing page.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  consent boolean not null,
  source text not null default 'landing_page',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  status text not null default 'new',
  constraint leads_consent_must_be_true check (consent = true)
);

-- Case-insensitive uniqueness on email powers the "already registered" duplicate check.
create unique index if not exists leads_email_lower_idx on public.leads (lower(email));

-- Row Level Security is enabled with zero policies: no anon/authenticated role can
-- read, insert, update or delete directly. All writes go through the server-side
-- Server Action using the service role key, which bypasses RLS.
alter table public.leads enable row level security;
