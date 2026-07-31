---
name: Token Privacy Refactor
description: "Move per-user secrets out of public.users so no signed-in account can read another account's Notion credentials."
status: active
created: 2026-07-30
revised: 2026-07-30
---

> **Progress.** Phases 1 and 2 are applied and deployed (commit `c8b423a`).
> Phase 3 is **blocked on signed-in verification** — see the checklist. Until
> Phase 3 runs, the tokens still exist in `public.users` and `authenticated`
> can still read them, so **the exposure is not yet closed.** Phase 2 moved the
> application onto the new table; Phase 3 is what actually removes the data.

# Token Privacy Refactor

> **Revision note.** An adversarial review of the first draft found two defects.
> The serious one: the draft cited `pages/embed/task-list.js` as *proof* a code
> path runs authenticated, when that file actually contains a cross-request
> token-bleed bug which this refactor would promote from latent to live. The
> second: the Stripe billing writer (`utils/useDatabase.js`) was missing from
> scope. The review rated that critical on the assumption payments were live —
> they are not (0 subscriptions, 0 rows with billing data), so it is a dormant
> landmine rather than a breakage. Still fixed here, because the scaffolding is
> being kept deliberately. Phase 3's `DROP COLUMN` safety was independently
> verified against `pg_depend`.

## Problem

`public.users` carries a permissive RLS policy — `"Public profiles are viewable by
everyone"` with `USING (true)` — because the leaderboard needs every player's
`full_name` and `avatar_url`. Multiple permissive SELECT policies are OR'd in
Postgres, so that policy overrides the stricter `"Can view own user data"` beside
it: **every row is readable by every role holding SELECT.**

The same table stores per-user secrets:

| Column | Populated | Sensitivity |
|---|---|---|
| `notion_auth_key` | 4,606 | Notion OAuth access token |
| `notion_user_email` | 4,604 | PII |
| `notion_user_name` | ~4,600 | PII |
| `notion_user_id` | ~4,600 | External identifier |
| `billing_address` | 0 | PII — dormant writer (Stripe not enabled) |
| `payment_method` | 0 | PII — dormant writer (Stripe not enabled) |

`anon` was narrowed to 11 safe columns already. **`authenticated` holds
table-level SELECT on all 17**, so any of ~9,000 accounts can read all 4,606
tokens.

### Why not simply revoke the columns from `authenticated`

1. **Column grants break `select('*')`.** PostgREST expands it to `SELECT *`,
   which needs *table-level* SELECT and is refused when only individual columns
   are granted. `utils/useUser.js:62` does exactly that. The same mistake against
   `anon` briefly 401'd the users endpoint in production.
2. **`.update()` returns a representation.** supabase-js v1 defaults to
   `Prefer: return=representation`, performing a `RETURNING` that needs SELECT on
   the returned columns — `pages/auth/notion/callback.js` would fail on every
   Notion connect.

More fundamentally, revoking leaves the secrets in a table whose default posture
is "readable by everyone". One stray `GRANT SELECT ON users` — a dashboard click,
a future migration — silently reopens it. We want the safe state to be
structural, not a grant someone has to remember.

## Solution

Move the six sensitive columns to `public.user_private`, keyed by user id, with
`auth.uid() = id` RLS and **no grants to `anon`**. `public.users` then holds only
public profile data, so a table-level grant on it is safe by construction.

`utils/useUser.js` fetches `user_private` for the signed-in user and merges it
into `userProfile`, so the six consumer call sites in `ConnectNotion.js`,
`NewNotionDatabases.js` and `ModalUpdates.js` need **no changes**.

Rejected: a `my_account` view over `users` — reads well, but leaves the secrets
in `users`. Fixes the symptom, not the posture.

### Acknowledged limitation

`notion_credentials.api_secret_key` holds a **copy** of the same Notion token
(written by `NewNotionDatabases.js:25`, read back by `task-list.js`). That table
is scoped by `auth.uid() = player`, so it isn't leaking — but this refactor
closes one of two doors, and the second is guarded by exactly the kind of policy
this plan argues against relying on. Consolidating the two credential paths
belongs with the Notion sync work; noting it here so it isn't a silent gap.

## Scope

### In scope
- New `public.user_private` table + RLS + grants + backfill
- `utils/useUser.js` — fetch and merge private fields (+ harden `allSettled`)
- `pages/auth/notion/callback.js` — write to `user_private`; guard null `user`
- `pages/api/account-data.js` — read `notion_auth_key` from `user_private`
- `pages/embed/task-list.js` — read from `user_private`, **plus** replace the
  shared server-side client and tolerate zero rows
- `utils/useDatabase.js` — Stripe billing writer, repoint to `user_private`
- Drop the six columns from `public.users` (final phase, post-deploy)

### Out of scope
- **Rotating the 4,606 exposed tokens.** Explicitly declined.
- `notion_credentials` consolidation (see limitation above).
- `authentication_links` enumerable embed tokens — its own plan.
- The `USING (true)` policy on `users` — correct once the table is public-only.
- `handle_new_user` — deliberately *not* changed. A lazily-created row via upsert
  beats a trigger inserting ~9,000 empty rows. Roughly half of all users will
  legitimately have no `user_private` row; every read path must tolerate that.

## Phases

Ordering is the whole risk. The app must read the new table **before** the old
columns disappear, and keep working while both exist.

### Phase 1: Create and backfill (additive — nothing breaks)
**Status:** done — 9,040 rows backfilled (== `count(users)`), 4,608 with a token.
Verified `anon` refused, and `authenticated` *without* a JWT sees 0 rows, so RLS
is enforcing rather than merely declared.
**Migration:** `create_user_private`

```sql
-- Types verified against information_schema: notion_* are varchar,
-- billing_address/payment_method are jsonb, users.id is uuid.
CREATE TABLE public.user_private (
  id                uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  notion_auth_key   varchar,
  notion_user_id    varchar,
  notion_user_name  varchar,
  notion_user_email varchar,
  billing_address   jsonb,
  payment_method    jsonb,
  private_updated_at timestamptz NOT NULL DEFAULT now()
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
FROM public.users;
```

The timestamp column is named `private_updated_at`, **not** `updated_at`:
`public.users` already has an `updated_at`, and `useUser.js` spreads both objects
into one `userProfile`. A shared name would silently clobber the users value.

Backfill is unconditional (no `WHERE`) — one row per user, simpler predicate, and
it makes every later write a plain update rather than a conditional upsert.

Verify:
```sql
SELECT has_table_privilege('anon','public.user_private','SELECT');  -- false
SELECT count(*) FROM public.user_private;                            -- == count(users)
SELECT count(*) FROM public.user_private WHERE notion_auth_key IS NOT NULL; -- 4606
```

### Phase 2: Point the app at the new table, then deploy
**Status:** done — shipped in `c8b423a`, confirmed live (`user_private` present
in the deployed `_app` chunk). All public pages 200 with no client-side
exceptions. Signed-in paths are **not** yet verified; see Phase 3's gate.
**Files:** `utils/useUser.js`, `pages/auth/notion/callback.js`,
`pages/api/account-data.js`, `pages/embed/task-list.js`, `utils/useDatabase.js`

1. **`utils/useUser.js`** — add a fourth fetch and merge it:
   ```js
   const getUserPrivate = () =>
     supabase.from('user_private').select('*').eq('id', user.id);
   ```
   Merge **null-safely** — `{ ...null, ...priv }` evaluates to `priv`, i.e. a
   truthy object missing `full_name`/`latest_version`/`role`/`title`, which is
   worse than the current `null` because every consumer's `userProfile?.x` guard
   stops short-circuiting (`ModalUpdates.js:15` would compute `NaN`):
   ```js
   setUserProfile(profile ? { ...profile, ...(priv ?? {}) } : null);
   ```
   Do **not** use `.single()` — zero rows is normal; take `data?.[0] ?? {}`.

   While here, harden the existing `Promise.allSettled` block:
   `results[N].value.data` throws when a promise rejects (`.value` is undefined on
   a rejected settlement). Use `results[N]?.value?.data ?? null`. Adding a fourth
   promise makes that latent bug likelier.

2. **`pages/auth/notion/callback.js`**
   - Guard the null user before writing — `getServerSideProps` passes `user`
     straight through with no null check, so an expired cookie yields `null` and
     `user.id` throws into a swallowing catch:
     ```js
     if (!user) { setLoading(false); return; }
     ```
   - Repoint the write to `user_private` (upsert; the row exists after Phase 1's
     unconditional backfill, but upsert is correct for users created after it):
     ```js
     .from('user_private')
     .upsert({ id: user.id, notion_auth_key: ..., notion_user_id: ...,
               notion_user_name: ..., notion_user_email: ... })
     ```
   - **Delete the self-call at line 61.** `updateNotionCredentials` invokes itself
     inside its own `finally`, an unbounded loop of `notion_credentials` writes on
     every Notion connect. Unrelated to this refactor and independently shippable
     — see "Ship separately" below.

3. **`pages/api/account-data.js`** — `.from('user_private')`. Already builds a
   per-request client carrying the caller's token, so RLS scopes it correctly.
   Its `if (data)` guard already tolerates zero rows. No other change.

4. **`pages/embed/task-list.js`** — three changes, and this file is the riskiest:
   - **Replace the shared client.** Lines 39-41 call
     `supabase.auth.setAuth(token)` on the **module-level singleton** from
     `utils/supabase-client.js`, inside `getServerSideProps`. One Node process
     serves concurrent requests, so request B's token can overwrite request A's
     mid-flight. Today `users` has `USING (true)` and the query filters
     `.eq('id', user.id)`, so a bled token still returns the right row — the bug
     is masked. Under `user_private`'s `auth.uid() = id` RLS, a bled token makes
     `auth.uid()` mismatch the filter and the query returns **zero rows, no
     error**. Build a per-request client exactly as `account-data.js` does.
   - Repoint to `.from('user_private')`.
   - `const notion_user_id = userData?.notion_user_id;` — `.single()` on zero rows
     returns `data: null`, and the current bare deref would throw into the outer
     catch and redirect to `/credentials-invalid`, telling users their
     credentials are broken when they aren't.

5. **`utils/useDatabase.js:76-88`** — the Stripe billing writer. It does
   `.from('users').update({ billing_address, payment_method })` then
   `if (error) throw error`, so after Phase 3 it would hit
   `PGRST204 column not found` and throw out of the webhook handler.

   **This is dormant, not broken:** `copyBillingDetailsToCustomer` is only
   reached from `manageSubscriptionStatusChange` on a subscription event, and
   there are **0 subscriptions** and 0 rows with billing data — payments have
   never been switched on. The Stripe scaffolding is being kept intentionally,
   so the point of fixing it now is that Phase 3 would otherwise leave a
   landmine that detonates whenever payments *are* enabled, long after anyone
   remembers this refactor.

   Repoint to `.from('user_private').upsert({ id: uuid, billing_address,
   payment_method })`. It uses `supabaseAdmin` (service role), so RLS and grants
   are moot; upsert rather than update so a user created after the backfill
   still works.

**Deploy and confirm before Phase 3.** While both copies exist, either read path
returns correct data, so a stale bundle is harmless.

### Phase 3: Drop the columns (only after Phase 2 is live and verified)
**Status:** blocked. Phase 2 is live, but three of its paths are behind a login
and cannot be exercised without a session:

1. Sign in → the account page still lists your Notion databases
   (`/api/account-data` reading `user_private`)
2. Connect a Notion account → the token lands in `user_private`
3. `/embed/task-list` resolves for a Notion user, and renders sensibly for a
   user who has never connected Notion (the zero-row case)

Until those pass, the code revert path still exists because `public.users` keeps
its copy of the data. Dropping the columns removes that path (the backup table
below is the only way back), so do not run this phase on an unverified Phase 2.

**Migration:** `drop_private_columns_from_users`

```sql
-- Back up first; DROP COLUMN is not reversible.
CREATE TABLE public.users_private_columns_backup AS
SELECT id, notion_auth_key, notion_user_id, notion_user_name, notion_user_email,
       billing_address, payment_method
FROM public.users;
REVOKE ALL ON public.users_private_columns_backup FROM anon, authenticated;

ALTER TABLE public.users
  DROP COLUMN notion_auth_key,
  DROP COLUMN notion_user_id,
  DROP COLUMN notion_user_name,
  DROP COLUMN notion_user_email,
  DROP COLUMN billing_address,
  DROP COLUMN payment_method;

-- users now holds only public profile data, so restoring the blanket grant to
-- anon is safe *because the secrets are gone*, not because of a grant we must
-- remember. This also removes the column-grant fragility that caused the
-- production 401. (`authenticated` already has a table-level grant and is
-- unaffected either way.)
GRANT SELECT ON public.users TO anon;
```

**`DROP COLUMN` safety is verified, not assumed.** A `pg_depend`/`pg_rewrite`
sweep of every view and matview built on `public.users` shows they reference only
`id, full_name, avatar_url, background_url, role, title` — `mv_leaderboard_*`,
`s1_leaderboard`, `season_leaderboard`, `party_member_details`, `onboarding`,
`area_stats`, `week_win_count`. **No view, matview, trigger or function
references any of the six columns**, so the drop is not blocked and nothing
breaks. The only remaining code reference is `pages/account.js:1413-1423`, which
is entirely commented out.

## Validation

- [ ] `has_table_privilege('anon','public.user_private','SELECT')` → `false`
- [ ] As `anon` over REST: `user_private` → permission denied
- [ ] **From the browser, signed in** (not the SQL editor as service_role):
      `supabase.from('user_private').select('*')` returns exactly **1** row.
      This is the app's first RLS-gated *read* through the shared client — every
      existing read works as `anon` thanks to `USING (true)` — and its failure
      mode is silent zero rows, indistinguishable from "never connected Notion".
      Test it explicitly.
- [ ] `count(user_private)` == `count(users)`; 4,606 with a non-null token
- [ ] Connect Notion end-to-end → token lands in `user_private`
- [ ] Account page still lists Notion databases (`/api/account-data`)
- [ ] `/embed/task-list` resolves for a Notion user **and** renders sensibly for a
      user with no `user_private` row
- [ ] Stripe billing writer: **code review only** — payments are not enabled
      (0 subscriptions), so there is no event to trigger. Confirm by reading that
      `useDatabase.js` no longer references `users.billing_address` /
      `users.payment_method`
- [ ] `select('*')` on `users` works for anon and authenticated after Phase 3
- [ ] Supabase security advisor shows no new findings

## Risks

- **Phase ordering is load-bearing.** Dropping columns before Phase 2 deploys
  breaks Notion connect, the account page, and the Stripe webhook.
- **Zero rows is the normal case** for ~half of users. Every read path must
  tolerate it; `task-list.js:58` currently does not.
- **`task-list.js`'s shared-client bug is promoted from latent to live** by this
  refactor. It must be fixed in the same change, not after.
- **`.upsert()` returns a representation** in supabase-js v1, needing table-level
  SELECT on `user_private` — which `authenticated` has from Phase 1. Verified
  sound; no `{ returning: 'minimal' }` needed.
- **`DROP COLUMN` is irreversible** — hence the backup table in Phase 3.
- **`schema.sql` is already stale** (declares `users` with only 6 of 17 columns
  and a pre-`USING (true)` policy set). Phase 3 makes it actively wrong. Either
  refresh it or mark it a historical bootstrap file.
- The tokens were publicly readable for an unknown period and are **not** being
  rotated, by explicit decision. This stops further exposure; it does not undo
  past exposure.

## Ship separately (found during review, independent of this refactor)

- **`pages/auth/notion/callback.js:61`** — `updateNotionCredentials()` calls
  itself in its own `finally`: an unbounded loop of `notion_credentials` UPDATEs
  every time anyone connects Notion. One-line fix, no dependency on this plan,
  should go out on its own.
- **`pages/embed/task-list.js:62`** — when `notion_user_id` is falsy the function
  falls through and `getServerSideProps` returns `undefined`, which Next treats
  as an error. Pre-existing.
