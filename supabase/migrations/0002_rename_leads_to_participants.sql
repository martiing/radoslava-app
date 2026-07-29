-- Expands the lead-capture table into a full participant record for the
-- paid challenge: registration -> quiz -> personalized email -> Viber ->
-- payment -> group, tracked as an explicit stage pipeline. Renamed (not a
-- new table) so existing rows carry forward. Table/columns are named
-- generically so a future multi-tier coaching platform can reuse this
-- structure instead of requiring a rebuild.
alter table public.leads rename to participants;
alter index leads_email_lower_idx rename to participants_email_lower_idx;

alter table public.participants rename column status to stage;
alter table public.participants alter column stage set default 'registered';
alter table public.participants add constraint participants_stage_check
  check (stage in (
    'registered',
    'quiz_completed',
    'emailed',
    'messaged_viber',
    'paid',
    'added_to_group',
    'completed',
    'cancelled'
  ));

-- Separates the participant from the specific cohort/product she joined,
-- without building a full `programs` table until a second cohort exists.
alter table public.participants add column program_slug text not null default 'shape-squad-2026-09';

-- Money made explicit rather than assuming a single fixed price forever.
alter table public.participants add column amount_due_cents integer not null default 6500;
alter table public.participants add column currency text not null default 'EUR';
alter table public.participants add column payment_reference text;

-- Per-stage timestamps for fast list-view sorting/filtering in the admin
-- dashboard (participant_events below carries the full audit trail).
alter table public.participants add column quiz_completed_at timestamptz;
alter table public.participants add column emailed_at timestamptz;
alter table public.participants add column messaged_viber_at timestamptz;
alter table public.participants add column paid_at timestamptz;
alter table public.participants add column added_to_group_at timestamptz;
alter table public.participants add column stage_changed_at timestamptz not null default now();

-- Quiz results: raw structured answers plus derived, filterable summary
-- columns used by admin views and the personalized email.
alter table public.participants add column quiz_answers jsonb;
alter table public.participants add column goal_realism text
  check (goal_realism in ('realistic', 'ambitious', 'unrealistic'));
alter table public.participants add column goal_realism_score numeric;
-- Radoslava can correct a misfiring heuristic without losing the computed
-- value; readers should use `coalesce(goal_realism_override, goal_realism)`.
alter table public.participants add column goal_realism_override text
  check (goal_realism_override in ('realistic', 'ambitious', 'unrealistic'));
alter table public.participants add column primary_focus text
  check (primary_focus in ('nutrition', 'training', 'accountability', 'mindset'));
alter table public.participants add column has_limitations boolean not null default false;
alter table public.participants add column limitations_note text;

-- RLS stays enabled with zero policies (carried over from the leads table):
-- all access continues to go through the service-role server client only.
