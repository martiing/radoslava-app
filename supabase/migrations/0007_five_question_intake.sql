-- Replaces the 3-step register -> 9-question quiz -> email flow with a
-- single 5-question intake that goes straight to an on-page Viber CTA.
-- Email is no longer collected, so phone becomes the dedupe key; the old
-- 9-question quiz_answers/goal_realism columns are left untouched for
-- legacy participants already mid-funnel under the old flow.

-- Email was the sole identifier before; phone now plays that role.
alter table public.participants alter column email drop not null;
drop index if exists public.participants_email_lower_idx;
create unique index if not exists participants_phone_idx on public.participants (phone);

-- The 5-question intake's 3 selection answers, promoted to their own
-- columns rather than reusing quiz_answers (whose shape/consumers are
-- built around the old 9-field object and still serves legacy rows).
alter table public.participants add column primary_goal text
  check (primary_goal in ('weight_loss', 'tone_and_shape', 'muscle_gain', 'general_health'));
alter table public.participants add column training_track text
  check (training_track in ('gym', 'home', 'both'));
alter table public.participants add column experience_level text
  check (experience_level in ('beginner', 'intermediate', 'advanced'));

-- RLS stays enabled with zero policies: all access continues to go
-- through the service-role server client only.
