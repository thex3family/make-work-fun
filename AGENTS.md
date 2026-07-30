# Make Work Fun — Developer Guide

Gamified personal-development leaderboard. Wins flow in from Notion, become EXP and
gold, and rank players on a seasonal leaderboard.

General conventions live in `../AGENTS.md` (commit rules, git safety, line endings,
database discipline). This file covers what's specific to this repo.

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

- **Refresh:** `pg_cron` job `refresh-leaderboards` runs `REFRESH MATERIALIZED VIEW
  CONCURRENTLY` on both, every 5 minutes (`2-59/5 * * * *`, offset ~2 min after the
  Notion sync tick). New wins therefore appear on the leaderboard within ~5 minutes,
  not instantly. This is deliberate and fine at the current win volume.
- **Consequence:** profile edits (avatar/name/title) also lag up to 5 min on the
  leaderboard, because those columns are baked into the matview at refresh time. If
  that ever becomes a problem, split the matview to aggregates-only and join `users`
  live in the wrapper view.
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
  other players' names and avatars. It also holds per-user integration credentials
  and contact fields in the same row.
- **`anon` therefore has SELECT on an explicit column list, not the whole table.**
  Never widen that grant, and never add an anon-facing `select('*')` on `users`. If
  a public surface needs a new column, add that one column to the grant.
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

Verify any grant or policy change empirically before reporting it done:

```sql
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) FROM public.<relation>;
ROLLBACK;
```

## Integrations

- **Notion** — wins are pulled from each player's Notion "Success Plan" database.
  `@notionhq/client` is a direct dependency; server-side routes live under
  `pages/api/`. Per-player Notion credentials live in `notion_credentials`, and
  OAuth tokens on `users`.
- **Embeds** (`pages/embed/*`) render public overlay widgets addressed by a secret
  link id. They are anonymous surfaces — assume no session.
- **Stripe** — subscriptions, via `pages/api/webhooks`.
