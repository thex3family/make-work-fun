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
      url     := 'https://www.makework.fun/api/sync/notion?batch=10',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization',
                   'Bearer ' || (SELECT value FROM private.app_secrets WHERE name = 'sync_secret')
                 )
    );
  $$
);
```

**Why `batch=8` and `timeout_milliseconds := 20000`.** Both were tuned by
watching real runs, and both matter:

- A batch of 10 took **~9 seconds**. Vercel's Hobby tier kills functions at 10s,
  so 10 was one slow Notion call away from being truncated mid-run. 8 lands
  around 6-7s. Raise it only if you know you are on Pro (60s+).
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
