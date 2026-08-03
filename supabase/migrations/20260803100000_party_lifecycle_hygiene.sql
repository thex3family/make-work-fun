-- Party lifecycle hygiene, applied 2026-08-03. Three related changes:
--
-- 1. party_review reads narrowed to partymates. The old public SELECT let any
--    anonymous API call read every reflection's free text ("what could I have
--    done better") -- personal content per the repo's own access rules. The
--    leaderboard views keep working: they run with definer rights.
--
-- 2. party_details also derives Complete for stale recruiting. Every party
--    stuck in Recruiting was years past its due date and still advertised on
--    the Join A Party board. The 7-day grace matters: a new party's due_date
--    defaults to now(), so expiring at due_date exactly would complete a party
--    the moment it was created.
--
-- 3. A daily cron job persists what the view derives, so the table stops
--    drifting from what every surface displays. The 2-day gate for In
--    Progress parties matches the leader's manual "Mark Challenge As
--    Complete" button. Verified before scheduling: nothing in the app grants
--    a completion reward on status 4, so this re-prices nothing.

drop policy "Enable read access for all users" on public.party_review;

create policy "Enable read for members of the same party"
on public.party_review
for select
to authenticated
using (
  exists (
    select 1
    from public.party_members reviewed
    join public.party_members me on me.party_id = reviewed.party_id
    where reviewed.id = party_review.party_member
      and me.player = (select auth.uid())
  )
);

create or replace view public.party_details as
 SELECT party.id,
    party.name,
    party.challenge,
    party.description,
    party.due_date,
        CASE
            WHEN ((now() >= party.due_date) AND (party.status = 2)) THEN (3)::bigint
            WHEN ((now() >= (party.due_date + interval '7 days')) AND (party.status = 1)) THEN (4)::bigint
            ELSE party.status
        END AS status,
    party.slug,
    party.daily_target,
    party.created_on,
    party.start_date,
    party.created_by
   FROM party;

select cron.schedule(
  'complete-overdue-parties',
  '23 3 * * *',
  $$
    UPDATE public.party SET status = 4
    WHERE (status = 2 AND due_date + interval '2 days' <= now())
       OR (status = 1 AND due_date + interval '7 days' <= now());
  $$
);
