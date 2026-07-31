---
name: Token Privacy Refactor
description: "Move per-user secrets out of public.users so no signed-in account can read another account's Notion credentials."
status: draft
created: 2026-07-30
---

# Token Privacy Refactor

## Problem

`public.users` carries a permissive RLS policy — `"Public profiles are viewable by
everyone"` with `USING (true)` — because the leaderboard needs every player's
`full_name` and `avatar_url`. Multiple permissive SELECT policies are OR'd in
Postgres, so that one policy overrides the stricter `"Can view own user data"`
sitting beside it: **every row is readable by every role that holds SELECT.**

The same table also stores per-user secrets:

| Column | Populated rows | Sensitivity |
|---|---|---|
| `notion_auth_key` | 4,606 | Notion OAuth access token |
| `notion_user_email` | 4,604 | PII |
| `notion_user_name` | ~4,600 | PII |
| `notion_user_id` | ~4,600 | External identifier |
| `billing_address` | 0 | PII (unused today) |
| `payment_method` | 0 | PII (unused today) |

`anon` was already narrowed to 11 safe columns. **`authenticated` still holds
SELECT on all 17**, so any one of ~9,000 accounts can read all 4,606 tokens.

### Why not just revoke the columns from `authenticated`

Two reasons, both learned the hard way this session:

1. **Column-level grants break `select('*')`.** PostgREST expands it to
   `SELECT *`, which requires *table-level* SELECT and is refused when only
   individual columns are granted. `utils/useUser.js:62` does exactly that.
   The same mistake against `anon` briefly 401'd the users endpoint.
2. **`.update()` returns a representation.** supabase-js v1 defaults to
   `Prefer: return=representation`, which performs a `RETURNING` and therefore
   needs SELECT on the returned columns. `pages/auth/notion/callback.js` would
   start failing on every Notion connect.

Even done correctly, revoking leaves the secrets sitting in a table whose
default posture is "readable by everyone" — one stray `GRANT SELECT ON users`
(a dashboard click, a future migration) silently reopens it. We want the safe
state to be structural, not a grant we have to keep remembering.

## Solution

Move the six sensitive columns into a new `public.user_private` table, keyed by
user id, with `USING (auth.uid() = id)` RLS and **no grants to `anon` at all**.
`public.users` keeps only public profile data, so a table-level grant on it is
safe by construction.

Consumers are insulated by a single change: `utils/useUser.js` fetches
`user_private` for the signed-in user and merges it into `userProfile`. Every
component that reads `userProfile.notion_auth_key` / `notion_user_id` / etc.
keeps working **unchanged** — 6 call sites across `ConnectNotion.js`,
`NewNotionDatabases.js` and `ModalUpdates.js` need no edit.

Rejected: a `my_account` view over `users`. It reads well but leaves the
secrets in `users`, so it fixes the symptom and not the posture.

## Scope

### In scope
- New `public.user_private` table + RLS + grants
- Backfill from `public.users`
- `utils/useUser.js` — fetch and merge private fields
- `pages/auth/notion/callback.js` — write to `user_private`
- `pages/api/account-data.js` — read `notion_auth_key` from `user_private`
- `pages/embed/task-list.js` — read `notion_user_id` from `user_private`
- Drop the six columns from `public.users` (final phase, after deploy)

### Out of scope
- **Rotating the 4,606 exposed tokens.** Explicitly declined. They remain valid.
- `notion_credentials.api_secret_key` — a separate per-user token store, already
  correctly scoped by `auth.uid() = player`. Consolidating the two credential
  paths belongs with the Notion sync work, not here.
- `authentication_links` enumerable embed tokens — its own plan.
- The `USING (true)` policy on `users` itself. It is correct once the table holds
  only public data; that is the point of this refactor.

## Phases

Ordering is the whole risk here. **The app must be able to read from the new
table before the old columns disappear**, and it must keep working during the
window where both exist.

### Phase 1: Create and backfill (additive — nothing breaks)
**Status:** not started
**Migration:** `create_user_private`

```sql
-- Types verified against information_schema: the notion_* columns are varchar,
-- billing_address and payment_method are jsonb, users.id is uuid.
CREATE TABLE public.user_private (
  id                uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  notion_auth_key   varchar,
  notion_user_id    varchar,
  notion_user_name  varchar,
  notion_user_email varchar,
  billing_address   jsonb,
  payment_method    jsonb,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own private data"
  ON public.user_private FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE ALL ON public.user_private FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.user_private TO authenticated;
GRANT ALL ON public.user_private TO service_role;

INSERT INTO public.user_private
  (id, notion_auth_key, notion_user_id, notion_user_name, notion_user_email,
   billing_address, payment_method)
SELECT id, notion_auth_key, notion_user_id, notion_user_name, notion_user_email,
       billing_address, payment_method
FROM public.users
WHERE notion_auth_key IS NOT NULL OR notion_user_id IS NOT NULL
   OR notion_user_email IS NOT NULL OR billing_address IS NOT NULL;
```

After applying, verify anon is locked out and the row count matches:
```sql
SELECT has_table_privilege('anon','public.user_private','SELECT');  -- false
SELECT count(*) FROM public.user_private;                            -- ~4,606
```

### Phase 2: Point the app at the new table, then deploy
**Status:** not started
**Files:** `utils/useUser.js`, `pages/auth/notion/callback.js`,
`pages/api/account-data.js`, `pages/embed/task-list.js`

1. **`utils/useUser.js`** — add a `getUserPrivate` fetch alongside the existing
   three and spread it into `userProfile` so downstream consumers are unchanged:
   ```js
   const getUserPrivate = () =>
     supabase.from('user_private').select('*').eq('id', user.id);
   ```
   Merge as `setUserProfile({ ...profile, ...(priv ?? {}) })`. Do **not** use
   `.single()` — a user with no private row is normal and `.single()` errors
   (PGRST116) on zero rows; take `data?.[0] ?? {}`.

   While in this file, harden the existing `Promise.allSettled` handling:
   `results[N].value.data` throws when a promise rejects (`.value` is undefined
   on a rejected settlement). Use `results[N]?.value?.data ?? null`. Adding a
   fourth promise makes that latent bug likelier, so fix it in the same change.

2. **`pages/auth/notion/callback.js:22-28`** — replace the `users` update with
   an upsert into `user_private` (the row may not exist yet):
   ```js
   .from('user_private')
   .upsert({ id: user.id, notion_auth_key: ..., notion_user_id: ...,
             notion_user_name: ..., notion_user_email: ...,
             updated_at: new Date().toISOString() })
   ```

3. **`pages/api/account-data.js:60-63`** — `.from('user_private')`. Already uses
   a per-request client carrying the caller's token, so RLS scopes it correctly.

4. **`pages/embed/task-list.js:52-56`** — `.from('user_private')`. Already calls
   `supabase.auth.setAuth(token)`, so it runs as `authenticated`.

**Deploy and confirm before Phase 3.** During this window both copies exist and
either read path returns correct data, so a stale bundle is harmless.

### Phase 3: Drop the columns (only after Phase 2 is live and verified)
**Status:** not started
**Migration:** `drop_private_columns_from_users`

```sql
ALTER TABLE public.users
  DROP COLUMN notion_auth_key,
  DROP COLUMN notion_user_id,
  DROP COLUMN notion_user_name,
  DROP COLUMN notion_user_email,
  DROP COLUMN billing_address,
  DROP COLUMN payment_method;

-- users now holds only public profile data, so the blanket grant is safe again
-- and select('*') keeps working for every role.
GRANT SELECT ON public.users TO anon;
```

Restoring the table-level grant to `anon` is the point of the exercise: it
removes the column-grant fragility that caused today's 401, and it is safe
*because the secrets are gone*, not because of a grant we must remember.

## Validation

- [ ] `has_table_privilege('anon','public.user_private','SELECT')` is `false`
- [ ] As `anon`: `SELECT count(*) FROM user_private` → 0 rows or permission denied
- [ ] As a signed-in user: `user_private` returns exactly **1** row (their own)
- [ ] Row count in `user_private` matches the pre-migration count of populated
      `users.notion_auth_key` (4,606)
- [ ] Connect a Notion account end-to-end → token lands in `user_private`
- [ ] Account page still lists Notion databases (exercises `/api/account-data`)
- [ ] `/embed/task-list` still resolves `notion_user_id`
- [ ] `select('*')` on `users` works for anon and authenticated after Phase 3
- [ ] Supabase security advisor shows no new findings

## Risks

- **Phase ordering is load-bearing.** Dropping columns before Phase 2 deploys
  breaks Notion connect and the account page. Do not compress the phases.
- **`.upsert()` also returns a representation** in supabase-js v1. It needs
  SELECT on `user_private`, which `authenticated` has — fine here, but the same
  trap is what makes the revoke-only approach fail.
- **A user with no `user_private` row is normal** (never connected Notion). Every
  read path must tolerate zero rows.
- **`DROP COLUMN` is not reversible** — the data lives on in `user_private`, but
  take a backup of the six columns before Phase 3 anyway.
- The tokens were publicly readable for an unknown period and are **not** being
  rotated, by explicit decision. This refactor stops further exposure; it does
  not undo past exposure.
