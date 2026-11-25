# Scheduling the Notion sync

The sync lives at `pages/api/sync/notion.js` and is triggered on a schedule by
Postgres itself, using `pg_cron` (the clock) and `pg_net` (the HTTP call). Both
extensions ship with Supabase on every plan, including free — there is no
separate scheduler to pay for or maintain, and nothing to keep running when the
n8n box is switched off.

## Prerequisites

1. The sync route is **deployed** — scheduling it before that just fires at a 404.
2. `SYNC_SECRET` is set in the Vercel project (Production, at minimum). Generate
   one with `openssl rand -hex 32`. The route rejects any request without a
   matching `Authorization: Bearer` header.
3. `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel. The route writes with the
   service key because it reads `sync_candidates`, which holds credentials and
   is deliberately unreadable by `anon` and `authenticated`.

## Enable the extensions

Run once:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

## Store the secret in the database

The cron job reads its bearer token from `private.app_secrets` rather than
carrying a literal, so rotating it is one `UPDATE` and no secret lands in
migration history. The `private` schema is not in PostgREST's exposed schema
list, so it is unreachable over the REST API regardless of grants.

```sql
INSERT INTO private.app_secrets (name, value, note)
VALUES ('sync_secret', '<SYNC_SECRET>', 'must match SYNC_SECRET in Vercel')
ON CONFLICT (name) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();
```

Supabase Vault would be the nicer home, but its encryption routine needs a
pgsodium key permission that the normal connection does not hold.

## Schedule it

```sql
SELECT cron.schedule(
  'notion-sync',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://www.makework.fun/api/sync/notion?batch=16',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization',
                   'Bearer ' || (SELECT value FROM private.app_secrets WHERE name = 'sync_secret')
                 ),
      timeout_milliseconds := 20000
    );
  $$
);
```

**`batch=16` is a ceiling, not a target.** The route bounds each run by time,
not count (constants at the top of `pages/api/sync/notion.js`): four workers
take credentials in parallel, each starting one only while 2.5s of a 7s
budget remain, and every Notion call has its own timeout. A typical run checks
all 16 in about 5s. `batch` only needs to be large enough to keep the four
workers busy.

**Why the time budget exists.** From 30 Oct to 25 Nov 2026 every run hit
Vercel Hobby's 10s limit and no wins synced. The Notion client waits up to 60s
per call by default, and a credential was recorded only *after* it was synced,
so one slow credential at the head of the queue killed each run before anything
was written, and the next run picked it again. Now a credential is claimed
(`last_synced_at`) before work starts, so even a killed run moves it to the back
of the queue. Timeouts, rate limits and Notion 5xx are recorded as
`(transient)` and don't count toward disabling a credential.

**Why `timeout_milliseconds := 20000`:**

- `pg_net`'s default timeout is about **5 seconds**, so it gave up before the
  route finished and logged `"Timeout was reached"` with a null status on every
  single run. The sync still completed — Vercel keeps executing after the client
  disconnects — but `net._http_response` was useless for telling whether it had.
  Without the explicit timeout you are blind in exactly the way this file warns
  about below.

**Why nothing starves.** `sync_candidates` orders by *how overdue* each
credential is — hot ones (a win in the last 90 days) come due every 10 minutes,
cold ones every 24 hours, and the most overdue wins the slot. An earlier version
sorted all hot ahead of all cold, which starved the cold tier permanently: a
returning player is cold, and could never become hot because becoming hot
requires a win to sync, which requires being polled.

The `notion-sync` job runs at `:00,:05,…` and `refresh-leaderboards` at
`:02,:07,…` so the two do not contend.

## Watching it

**`pg_cron` records that it fired, not that it worked.** `pg_net` is
fire-and-forget: if the endpoint 500s, the cron job still logs success. This is
the same blind spot the old n8n error handling had, so check both sides.

Did the job fire?

```sql
SELECT jobid, runid, status, return_message, start_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'notion-sync')
ORDER BY start_time DESC
LIMIT 20;
```

What did the endpoint actually answer?

```sql
SELECT id, status_code, content, created
FROM net._http_response
ORDER BY created DESC
LIMIT 20;
```

Is the sync making progress? This is the one that matters — a credential whose
`last_synced_at` is stale is not being reached at all:

```sql
SELECT count(*) FILTER (WHERE last_synced_at > now() - interval '1 hour') AS synced_last_hour,
       count(*) FILTER (WHERE consecutive_failures > 0)                   AS currently_failing,
       count(*) FILTER (WHERE error IS TRUE)                              AS given_up_on,
       min(last_synced_at)                                                AS oldest_sync
FROM public.notion_credentials
WHERE error IS NOT TRUE;
```

## Changing or removing the schedule

```sql
SELECT cron.unschedule('notion-sync');
```

Re-running `cron.schedule` with the same job name replaces it.

## Running it by hand

```bash
curl -X POST https://<your-domain>/api/sync/notion \
  -H "Authorization: Bearer $SYNC_SECRET"
```

Add `?batch=50` to push a larger batch through — useful for working down the
round-robin backlog after a period of downtime. The route caps this at 50 to
stay inside Vercel's function timeout (10s on Hobby, 60s+ on Pro).

# Refreshing the leaderboards

`refresh-leaderboards` (`2-59/5 * * * *`) runs
`private.refresh_leaderboards_if_changed()` (migration
`20261123120000_refresh_leaderboards_on_change.sql`). A full refresh of both
materialized views takes about 20 s, so the function skips it unless:

- the **fingerprint** changed: the sum of insert, update and delete counters in
  `pg_stat_user_tables` for every table the views read (`success_plan`,
  `completed_habits`, `habits`, `users`, `energy`, `item_purchases`, `titles`), or
- the **hour** rolled over since the last refresh, because `exp_earned_today`,
  `exp_earned_week` and the season's `latest` flag depend on the clock.

A skipped tick takes a few milliseconds. A new win usually appears within 5
minutes, and at worst within about 6: Postgres publishes table counters with a
short delay, so a write committed just before a tick is caught on the next one.
Postgres keeps these counters across a clean restart (seen when the plan
changed), so a restart alone doesn't force a refresh; the hourly one covers it.
A crash resets them, which reads as a change and costs one harmless refresh.

**If the views ever start reading another table, add it to the function's list.**
The tables come from `pg_depend` on the two views, through `all_wins`.

Force a refresh now:

```sql
UPDATE private.leaderboard_refresh_state SET fingerprint = NULL;
SELECT private.refresh_leaderboards_if_changed();  -- 'refreshed'
```

Did recent ticks refresh or skip?

```sql
SELECT start_time, end_time - start_time AS took, return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'refresh-leaderboards')
ORDER BY start_time DESC
LIMIT 20;
```
