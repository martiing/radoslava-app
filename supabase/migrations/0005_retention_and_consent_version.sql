-- Record which privacy-policy version each participant accepted and purge old,
-- unconverted registrations. Paying/active participant records are excluded;
-- their retention must follow the final contract, accounting and legal policy.

alter table public.participants
  add column if not exists consent_policy_version text not null default 'pre-versioning';

alter table public.participants
  add constraint participants_consent_policy_version_length
  check (char_length(consent_policy_version) <= 40);

create extension if not exists pg_cron;

select cron.schedule(
  'purge-expired-unconverted-participants',
  '0 3 * * *',
  $$
    delete from public.participants
    where created_at < now() - interval '12 months'
      and paid_at is null
      and stage in (
        'registered',
        'quiz_completed',
        'emailed',
        'messaged_viber',
        'cancelled'
      )
  $$
);

-- The 12-month interval must match the approved privacy policy. To inspect or
-- remove the job:
--   select * from cron.job;
--   select cron.unschedule('purge-expired-unconverted-participants');
