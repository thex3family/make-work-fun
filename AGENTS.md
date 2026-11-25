# Make Work Fun — Developer Guide

Gamified personal-development leaderboard. Wins flow in from Notion, become EXP and
gold, and rank players on a seasonal leaderboard.

This file covers what's specific to this repo. General conventions (commit rules,
git safety, line endings, database discipline) come from your machine-wide agent
instructions.

**This is a public open-source repository.** Commit messages, comments, and docs are
world-readable. Write them for that audience.

---

## Stack

| | |
|---|---|
| Framework | Next.js 12 (pages router), React 17 |
| Package manager | **yarn** (`yarn.lock` is authoritative — do not introduce `package-lock.json`) |
| Styling | Tailwind 2 + several component libraries (Mantine, MUI, antd) |
| Backend | Supabase — `@supabase/supabase-js` **v1** |
| Payments | Stripe |
| Trunk branch | `master` (not `main`) |

**Dependency debt worth knowing before you build on it:** `supabase-js` v1 and
`supabase-auth-helpers` v1 are both end-of-life; Next 12 and React 17 are several
majors behind. Don't casually upgrade mid-feature — the v1→v2 Supabase migration
changes auth and error handling everywhere and deserves its own plan.

## Local setup

```bash
yarn
cp .env.local.example .env.local   # fill in Supabase + Stripe keys
yarn dev
```

`.env.local` is required — the app cannot start without `NEXT_PUBLIC_SUPABASE_URL`
and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Deployment

Deploys are configured in the Vercel dashboard via its GitHub integration — there is
no `vercel.json` or GitHub Actions workflow in this repo, so **the deploy config is
not visible from the source tree**. Confirm in Vercel before assuming a push has
shipped.

**Ordering rule:** when a change spans app code and database grants, deploy the app
first, then apply the database change. Reversing the order takes the site down for
the window between them.

---

## Seasons

Seasons are **calendar quarters starting 2021-07-01**, which is Season 1. Season 21
is 2026 Q3.

**Never hardcode a season anywhere.** This used to require a manual edit every
quarter in two places — the SQL view and the leaderboard heading — and when the
hardcoded table ran out, new wins were silently bucketed into `'0S'`.

The season is computed in two mirrored places, which must stay in sync:

| Layer | Where |
|---|---|
| Database | `public.season_of(date)`, `public.season_of(timestamptz)`, `public.current_season()` |
| App | `utils/season.js` — `seasonNumber`, `seasonTag`, `seasonNumberFromTag`, `seasonDateRange`, `seasonLabel` |

**The database is the source of truth.** UI should derive the displayed season from
the `season` column on rows it already fetched (every leaderboard query filters
`.eq('latest', true)`), falling back to the calendar only while the fetch is in
flight. See `pages/leaderboard.js`. That way the heading cannot drift from the data.

`season_of(timestamptz)` buckets by calendar date in the session timezone. Note that
`all_wins.closing_date` is `timestamptz` while `success_plan.closing_date` is `date`.

## Leaderboards are materialized — they are NOT live

`leaderboard` and `leaderboard_season` are thin views over materialized views
(`mv_leaderboard_alltime`, `mv_leaderboard_season`). The heavy aggregate — which
reads `all_wins` several times, each redoing a UNION dedupe over ~120k rows — used
to run on *every* anonymous page load and took ~5s (all-time) and ~17s (season).
Now it runs once per refresh.

- **Refresh:** `pg_cron` job `refresh-leaderboards` ticks every 5 minutes
  (`2-59/5 * * * *`, offset ~2 min after the Notion sync tick) and calls
  `private.refresh_leaderboards_if_changed()`. That runs `REFRESH MATERIALIZED VIEW
  CONCURRENTLY` on both views only when a write touched one of the tables they read,
  or the hour rolled over; otherwise it returns in milliseconds. The refresh costs
  ~20 s, which the free plan's small server can't afford every 5 minutes. New wins
  appear within ~5 minutes (worst case ~6), not instantly. Details and the table
  list the function watches are in `supabase/README-cron.md`; if the views start
  reading another table, add it there.
- **Consequence:** profile edits (avatar/name/title) also lag up to 5 min on the
  leaderboard, because those columns are baked into the matview at refresh time. If
  that ever becomes a problem, split the matview to aggregates-only and join `users`
  live in the wrapper view.
- **Anything a player acts on must not come from these views.** The item shop
  reads the signed-in player's gold from `public.my_season_gold()` (same formula
  as `total_gold`, one player, ~20 ms) because a stale balance let the same gold
  be spent twice. The new-season modal waits for the player to appear in
  `leaderboard_season` instead of reloading straight back into itself.
- **`latest`, `exp_earned_today`, `exp_earned_week`** are frozen at refresh time too
  (≤5 min stale). At a quarter boundary the `latest` flag flips within one refresh.
- **Do not add `security_invoker = true`** to the wrapper views. They must run with
  definer rights so `anon` can read other players' names/avatars through them despite
  `users` RLS — the whole leaderboard is intentionally public.
- **The `mv_*` matviews are NOT granted to `anon`/`authenticated`** — clients read the
  named views only. Keep it that way; the Supabase advisor flags API-exposed matviews.
- **Editing the leaderboard logic** means editing the matview body (a migration), not
  a view. The wrapper views are just `SELECT * FROM mv_...`. After changing a matview,
  `REFRESH` it and confirm row counts/EXP totals are unchanged (snapshot before/after).
- **`all_wins` uses `UNION`, not `UNION ALL`, on purpose.** ~2,100 rows in
  `success_plan` are distinct wins (distinct `notion_id`) that share
  name/exp/dates; the UNION collapses them. Switching to `UNION ALL` would add
  ~164k EXP across 76 players — a scoring change, not an optimization. Don't.

`leaderboard_stats` is a one-row view over `mv_leaderboard_alltime` giving the
homepage its three hero numbers (players, level-ups, total EXP) cheaply, instead of
pulling the whole 5000-row leaderboard client-side.

## Database access rules

- **`public.users` is intentionally readable by everyone** — the leaderboard needs
  other players' names and avatars. It holds **public profile columns only**.
- **Anything private goes in `public.user_private`** (Notion OAuth token and
  identity, billing address, payment method), one row per user, RLS
  `auth.uid() = id`. Never add a secret or contact column to `users`: `anon` has
  table-level SELECT on it, so a new column there is public the moment it exists.
- **A column-level `REVOKE` cannot subtract from a table-level `GRANT`.** Supabase
  gives roles table-wide grants by default (`anon=arwdDxt/postgres`), so
  `REVOKE SELECT (col) ... FROM anon` silently does nothing. Column grants also
  break PostgREST `select=*`. That is why secrets were moved to their own table
  rather than hidden by column grants.
- **Multiple permissive RLS policies are OR'd.** One policy with `USING (true)`
  defeats every stricter policy beside it on the same table and command. Check the
  existing policies before adding one, not just the one you are writing.
- The single `select('*')` on `users` (`utils/useUser.js`) runs authenticated and
  fetches only the caller's own row. Keep it that way — better still, narrow it to
  the columns actually used.
- **Several `public` views are `SECURITY DEFINER`**, so they run as their owner and
  do not enforce the RLS of the underlying tables. Before exposing a new view,
  decide deliberately whether its contents are public; don't assume table RLS
  protects it.
- Win titles (`all_wins.name`, `recent_wins.name`) are user-authored personal
  content — treat them as private by default.
- `authentication_links.id` is the secret token embedded in share/embed URLs. It is
  a credential, not an identifier.

Verify any grant or policy change empirically before reporting it done. Prove
exposure with counts, column names and `has_*_privilege()` checks — never by
dumping rows of personal data:

```sql
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) FROM public.<relation>;
ROLLBACK;
```

## Storage

The project runs on the Supabase free plan: **1 GB of storage, 5 GB of downloads
a month**. Images are what fills both.

- **Every upload goes through `utils/uploadImage.js`.** It redraws still images
  no larger than the bucket's preset (512 px for avatars, items and shopkeepers;
  1920 px backgrounds; 1600 px dailies) and sends WebP, or PNG/JPEG on Safari,
  which can't encode WebP. GIF and WebP are sent unchanged because a canvas would
  drop their animation. Never call `supabase.storage...upload()` directly.
- **Buckets reject files over 5 MB** and anything that isn't a common image
  type or MP4 (migration `20261123130000_storage_bucket_limits.sql`).
- **Keys are random and never reused** for a different image, so uploads carry a
  one-year `cacheControl`.
- **Existing files were shrunk in place in Nov 2026**, under their old keys, by
  `scripts/storage/shrink.mjs`. A key's extension may not match its contents (a
  `.gif` can hold animated WebP, a `.heic` holds WebP). That's deliberate:
  renaming would have meant rewriting every row that points at an image.
  Browsers decode by content, not by name.
- **What counts as "in use"** is `REFERENCES` in `scripts/storage/lib.mjs`: the
  only columns whose values are storage keys. If you add a column that stores
  an upload, add it there too, or `prune.mjs` will treat those files as unused.
- Buckets are private; the app reads images with `supabase.storage.download()`.

## Backups

The free plan has **no backups**. A weekly `pg_dump` runs in the private repo
`thex3family/make-work-fun-backups` (GitHub Actions; dumps kept 90 days as
workflow artifacts). Its README says how to restore. Storage files aren't in the
dump; a full copy of storage as of 2026-11-23 is kept offline.

Before any risky data change, run that workflow by hand from its Actions tab, so
the most recent dump is minutes old rather than days.

## Integrations

- **Notion** — wins are pulled from each player's Notion "Success Plan" database.
  `@notionhq/client` is a direct dependency; server-side routes live under
  `pages/api/`. Per-player Notion credentials live in `notion_credentials`, and
  OAuth tokens in `user_private`.
- **Embeds** (`pages/embed/*`) render public overlay widgets addressed by a secret
  link id. They are anonymous surfaces — assume no session.
- **Stripe** — subscriptions, via `pages/api/webhooks`.
