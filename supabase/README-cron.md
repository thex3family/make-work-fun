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

## Schedule it

```sql
SELECT cron.schedule(
  'notion-sync',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://<your-domain>/api/sync/notion',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer <SYNC_SECRET>'
                 )
    );
  $$
);
```

Every five minutes the route takes the next batch of candidates — hot ones
first, then the round-robin sweep — so a run is bounded regardless of how many
credentials exist.

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
