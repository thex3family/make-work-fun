import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import { getLeaderboardStats } from '@/utils/supabase-client';

export default function HomePage({ players }) {
  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
          Join Our Family
        </h1>
        <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
          Unlock multiplayer for personal development.
        </p>
        <Link href="/player">
          <Button className="w-auto mx-auto my-10" variant="prominent">
            Get Started 🚀
          </Button>
        </Link>
      </div>

      <div className="mb-24 mx-auto flex justify-center flex-col flex-wrap sm:flex-row max-w-screen-2xl">
        {players.map((player, i) => (
          <Avatar
            key={i}
            statRank={player.player_rank}
            statName={player.full_name}
            statLevel={player.total_level}
            statEXP={player.total_exp}
            statGold={player.total_gold}
            statWinName={player.name}
            statWinType={player.type}
            statWinGold={player.gold_reward}
            statWinEXP={player.exp_reward}
            url={player.avatar_url}
          />
        ))}
      </div>
    </section>
  );
}

export async function getStaticProps() {
  const players = await getLeaderboardStats();

  return {
    props: {
      players
    },
    revalidate: 60
  };
}
