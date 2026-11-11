create table if not exists public.driver_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  start_latitude double precision not null
    check (start_latitude between -90 and 90),
  start_longitude double precision not null
    check (start_longitude between -180 and 180),
  stopped_at timestamptz,
  stop_latitude double precision
    check (stop_latitude between -90 and 90),
  stop_longitude double precision
    check (stop_longitude between -180 and 180),
  constraint driver_sessions_stop_fields_consistent check (
    (stopped_at is null and stop_latitude is null and stop_longitude is null)
    or
    (stopped_at is not null and stop_latitude is not null and stop_longitude is not null)
  ),
  constraint driver_sessions_stop_after_start check (
    stopped_at is null or stopped_at >= started_at
  )
);

create index if not exists driver_sessions_user_started_at_idx
  on public.driver_sessions (user_id, started_at desc);

alter table public.driver_sessions
  add column if not exists start_utc_offset_minutes smallint
    check (start_utc_offset_minutes between -840 and 840),
  add column if not exists stop_utc_offset_minutes smallint
    check (stop_utc_offset_minutes between -840 and 840);

alter table public.driver_sessions enable row level security;

revoke all on table public.driver_sessions from anon, authenticated;
grant select, insert, update on table public.driver_sessions to authenticated;

drop policy if exists driver_sessions_select_own on public.driver_sessions;
create policy driver_sessions_select_own
  on public.driver_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists driver_sessions_insert_own on public.driver_sessions;
create policy driver_sessions_insert_own
  on public.driver_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists driver_sessions_update_own on public.driver_sessions;
create policy driver_sessions_update_own
  on public.driver_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace view public.driver_sessions_readable
  with (security_invoker = true)
as
select
  id,
  user_id,
  to_char(
    (started_at at time zone 'UTC')
      + make_interval(mins => coalesce(start_utc_offset_minutes, 0)),
    'Mon FMDD, YYYY "at" FMHH12:MI AM'
  ) as start_time,
  started_at,
  start_latitude,
  start_longitude,
  case
    when stopped_at is null then null
    else to_char(
      (stopped_at at time zone 'UTC')
        + make_interval(mins => coalesce(stop_utc_offset_minutes, 0)),
      'Mon FMDD, YYYY "at" FMHH12:MI AM'
    )
  end as end_time,
  stopped_at,
  stop_latitude,
  stop_longitude
from public.driver_sessions;

revoke all on public.driver_sessions_readable from anon, authenticated;
grant select on public.driver_sessions_readable to authenticated;
