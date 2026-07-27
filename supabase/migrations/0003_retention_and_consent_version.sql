-- GDPR housekeeping: prove what people consented to, and actually honour the
-- retention period the privacy policy promises.

-- 1. Record which version of the privacy policy each person agreed to.
--    Consent you cannot evidence is consent you do not have. The value comes
--    from siteConfig.footer.privacyPolicyVersion — bump that constant whenever
--    the policy text changes materially.
--
--    Existing rows predate the versioned policy, so they are marked as such
--    rather than being backfilled with a version nobody actually saw.
alter table public.leads
  add column if not exists consent_policy_version text not null default 'pre-versioning';

alter table public.leads
  add constraint leads_consent_policy_version_length
  check (char_length(consent_policy_version) <= 40);

-- 2. Automatic deletion once the retention period expires.
--
--    !! THE INTERVAL BELOW MUST MATCH THE PRIVACY POLICY !!
--    The policy currently has a placeholder for the retention period. Set both
--    to the same value before going live. A policy that promises deletion while
--    nothing deletes is worse than having no policy at all.
--
--    Requires the pg_cron extension: Supabase dashboard -> Database ->
--    Extensions -> enable "pg_cron". This migration will fail without it.
create extension if not exists pg_cron;

-- Runs daily at 03:00 UTC. cron.schedule is idempotent on the job name, so
-- re-running this migration updates the existing job rather than duplicating it.
select cron.schedule(
  'purge-expired-leads',
  '0 3 * * *',
  $$delete from public.leads where created_at < now() - interval '12 months'$$
);

-- To change the retention period later, re-run cron.schedule with the same job
-- name and a new interval. To inspect or remove it:
--   select * from cron.job;
--   select cron.unschedule('purge-expired-leads');
