-- Link each coaching participant to at most one Supabase Auth account.
-- The column stays nullable during the legacy-account migration: existing
-- challenge participants are linked later through a single-use invite flow.

alter table public.participants
  add column if not exists auth_user_id uuid
    references auth.users(id) on delete set null;

create unique index if not exists participants_auth_user_id_unique_idx
  on public.participants (auth_user_id)
  where auth_user_id is not null;

-- Public roles still receive no table privileges and there are no RLS
-- policies. Authenticated portal access continues through trusted server
-- actions, which resolve the account through auth_user_id.
revoke all on public.participants from anon, authenticated;
