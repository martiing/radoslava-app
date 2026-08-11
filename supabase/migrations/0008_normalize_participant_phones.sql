-- Canonicalize the participant identity key before enforcing it permanently.
--
-- Deliberately fail instead of guessing when legacy data is invalid or when
-- two existing rows collapse to the same E.164 number. Those cases require a
-- manual business decision about which participant record to keep/merge.

begin;

lock table public.participants in share row exclusive mode;

do $$
begin
  if exists (
    with compacted as (
      select regexp_replace(btrim(phone), '[[:space:]().-]', '', 'g') as phone
      from public.participants
    )
    select 1
    from compacted
    where phone !~ '^(0[0-9]{9}|\+359[0-9]{9}|00359[0-9]{9})$'
  ) then
    raise exception using
      errcode = 'check_violation',
      message = 'Cannot normalize participant phones: unrecognized legacy values exist';
  end if;
end
$$;

do $$
begin
  if exists (
    with compacted as (
      select regexp_replace(btrim(phone), '[[:space:]().-]', '', 'g') as phone
      from public.participants
    ),
    normalized as (
      select case
        when phone ~ '^0[0-9]{9}$' then '+359' || substring(phone from 2)
        when phone ~ '^00359[0-9]{9}$' then '+' || substring(phone from 3)
        else phone
      end as phone
      from compacted
    )
    select 1
    from normalized
    group by phone
    having count(*) > 1
  ) then
    raise exception using
      errcode = 'unique_violation',
      message = 'Cannot normalize participant phones: canonical duplicates exist';
  end if;
end
$$;

with compacted as (
  select
    id,
    regexp_replace(btrim(phone), '[[:space:]().-]', '', 'g') as phone
  from public.participants
),
normalized as (
  select
    id,
    case
      when phone ~ '^0[0-9]{9}$' then '+359' || substring(phone from 2)
      when phone ~ '^00359[0-9]{9}$' then '+' || substring(phone from 3)
      else phone
    end as phone
  from compacted
)
update public.participants as participant
set phone = normalized.phone
from normalized
where participant.id = normalized.id
  and participant.phone is distinct from normalized.phone;

create unique index if not exists participants_phone_idx
  on public.participants (phone);

alter table public.participants
  add constraint participants_phone_e164_check
  check (phone ~ '^\+359[0-9]{9}$');

commit;
