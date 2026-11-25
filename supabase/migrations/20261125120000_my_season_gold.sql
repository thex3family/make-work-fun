-- The signed-in player's gold for the current season, computed live.
--
-- The item shop used to read gold from leaderboard_season, a materialized
-- view refreshed every 5 minutes. After a purchase the shop kept showing the
-- old balance, and its "can you afford this?" check let players spend the
-- same gold again until the next refresh. This is the same formula as
-- total_gold in mv_leaderboard_season (this season's gold earned in all_wins,
-- minus this season's item_purchases), for one player, in ~20 ms.
--
-- SECURITY DEFINER because all_wins is not readable by `authenticated`. It
-- only ever answers for auth.uid(), so it can't read anyone else's gold.

create or replace function public.my_season_gold()
returns double precision
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select sum(w.gold_reward)
                     from public.all_wins w
                    where w.player = auth.uid()
                      and public.season_of(w.closing_date) = public.current_season()), 0)
       - coalesce((select sum(p.gold_spent)
                     from public.item_purchases p
                    where p.player = auth.uid()
                      and public.season_of(p.purchased_date) = public.current_season()), 0);
$$;

revoke all on function public.my_season_gold() from public, anon;
grant execute on function public.my_season_gold() to authenticated;
