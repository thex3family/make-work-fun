-- party_review had RLS enabled with a single SELECT policy and no INSERT or
-- UPDATE policy, so every reflection save from the app was denied:
--
--   42501 - new row violates row-level security policy for table "party_review"
--
-- The newest surviving review is dated 2024-01-02. The app never noticed
-- because ModalReview ignored the error and closed the modal from a `finally`,
-- so a denied save was indistinguishable from a successful one.
--
-- A player may write exactly the review attached to their own membership row.
-- The existing public SELECT policy is left alone; permissive policies are
-- OR'd, so this adds write access without widening reads.

create policy "Enable write for the reviewing member"
on public.party_review
for all
to authenticated
using (
  exists (
    select 1
    from public.party_members m
    where m.id = party_review.party_member
      and m.player = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.party_members m
    where m.id = party_review.party_member
      and m.player = (select auth.uid())
  )
);
