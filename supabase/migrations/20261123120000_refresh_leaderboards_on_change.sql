-- Refresh the leaderboard materialized views only when their inputs changed,
-- plus once an hour.
--
-- The refresh takes ~20 s and used to run every 5 minutes whether or not
-- anything had changed, which is most of the database's work and too much for
-- the Supabase free plan's shared-CPU server. Most ticks have nothing new.
--
-- "Changed" is a fingerprint: the sum of insert/update/delete counters in
-- pg_stat_user_tables for every base table the two views read. Any write moves
-- it. The Notion sync only writes rows for new wins (it skips pages it has
-- already marked), so idle ticks leave it alone. The counters reset when the
-- database restarts, which reads as a change and costs one harmless refresh.
--
-- The hourly refresh is needed because exp_earned_today, exp_earned_week and
-- the season's `latest` flag depend on the clock, not just on the data.

create table if not exists private.leaderboard_refresh_state (
  id int primary key default 1 check (id = 1),
  fingerprint bigint,
  refreshed_at timestamptz
);

insert into private.leaderboard_refresh_state (id) values (1) on conflict do nothing;

create or replace function private.refresh_leaderboards_if_changed()
returns text
language plpgsql
set search_path = ''
as $$
declare
  current_fp bigint;
  state private.leaderboard_refresh_state;
begin
  -- Keep this list in step with the tables mv_leaderboard_season and
  -- mv_leaderboard_alltime read (directly or through all_wins).
  select coalesce(sum(n_tup_ins + n_tup_upd + n_tup_del), 0)
    into current_fp
    from pg_catalog.pg_stat_user_tables
   where schemaname = 'public'
     and relname in ('success_plan', 'completed_habits', 'habits', 'users',
                     'energy', 'item_purchases', 'titles');

  select * into state from private.leaderboard_refresh_state where id = 1;

  if state.fingerprint is not distinct from current_fp
     and date_trunc('hour', now()) <= date_trunc('hour', state.refreshed_at) then
    return 'unchanged';
  end if;

  refresh materialized view concurrently public.mv_leaderboard_season;
  refresh materialized view concurrently public.mv_leaderboard_alltime;

  -- Store the fingerprint read *before* refreshing: a write that lands during
  -- the refresh moves the counters past it, so the next tick refreshes again.
  update private.leaderboard_refresh_state
     set fingerprint = current_fp, refreshed_at = now()
   where id = 1;

  return 'refreshed';
end;
$$;

revoke all on function private.refresh_leaderboards_if_changed() from public, anon, authenticated;

select cron.alter_job(
  (select jobid from cron.job where jobname = 'refresh-leaderboards'),
  command := 'select private.refresh_leaderboards_if_changed();'
);
