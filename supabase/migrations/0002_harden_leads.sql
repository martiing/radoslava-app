-- Defence in depth for public.leads.
--
-- Row Level Security is already enabled with zero policies in 0001, which is
-- the right design: no anon/authenticated role can touch the table and every
-- write goes through the server action using the service role key. This
-- migration adds the guarantees that RLS does not give us — constraints that
-- hold even if a future code path writes to the table directly.

-- 1. Length limits mirroring the zod schema in lib/validation/registration-schema.ts.
--    Without these, `text` columns accept unbounded input.
alter table public.leads
  add constraint leads_name_length check (char_length(name) between 2 and 100),
  add constraint leads_email_length check (char_length(email) between 3 and 254),
  add constraint leads_phone_length check (char_length(phone) between 5 and 20),
  add constraint leads_source_length check (char_length(source) <= 50),
  add constraint leads_status_length check (char_length(status) <= 30);

-- 2. Explicitly revoke table privileges from the public-facing roles.
--    RLS already blocks them, but revoking removes the second lock too: a
--    future `create policy` written carelessly cannot silently open the table.
revoke all on public.leads from anon, authenticated;

-- 3. Index for the admin view: leads are always read newest-first.
create index if not exists leads_created_at_idx on public.leads (created_at desc);
