-- Append-only log covering both the stage-transition audit trail and
-- mid-challenge notes/broadcasts, so a solo-operator admin tool doesn't
-- need two separate tables for what is really one timeline per participant.
create table if not exists public.participant_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  kind text not null check (kind in ('stage_change', 'note', 'email_sent', 'broadcast')),
  message text not null,
  meta jsonb
);

create index if not exists participant_events_participant_id_idx
  on public.participant_events (participant_id, created_at desc);

-- Same security model as participants: RLS enabled, zero policies, all
-- access via the service-role server client.
alter table public.participant_events enable row level security;
