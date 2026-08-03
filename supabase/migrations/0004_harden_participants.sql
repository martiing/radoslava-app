-- Defence in depth after 0002 renames leads to participants and 0003 creates
-- the append-only event log. RLS remains enabled with zero public policies;
-- all current application access goes through trusted server-side clients.

alter table public.participants
  add constraint participants_name_length check (char_length(name) between 2 and 100),
  add constraint participants_email_length check (char_length(email) between 3 and 254),
  add constraint participants_phone_length check (char_length(phone) between 5 and 20),
  add constraint participants_source_length check (char_length(source) <= 50),
  add constraint participants_program_slug_length check (char_length(program_slug) <= 100),
  add constraint participants_currency_length check (char_length(currency) = 3),
  add constraint participants_payment_reference_length
    check (payment_reference is null or char_length(payment_reference) <= 255),
  add constraint participants_limitations_note_length
    check (limitations_note is null or char_length(limitations_note) <= 500);

alter table public.participant_events
  add constraint participant_events_message_length check (char_length(message) between 1 and 5000);

-- RLS already blocks the public roles. Revoking privileges is a second lock so
-- a future policy cannot accidentally expose the tables on its own.
revoke all on public.participants from anon, authenticated;
revoke all on public.participant_events from anon, authenticated;

create index if not exists participants_created_at_idx
  on public.participants (created_at desc);
