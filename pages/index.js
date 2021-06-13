import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import { getLeaderboardStats } from '@/utils/supabase-client';

export default function HomePage({ players }) {

  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        
          <h1 className="text-4xl font-extrabold text-white text-center sm:text-6xl">
            Join Our Family
          </h1>
          <p className="mt-5 text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Unlock multiplayer for personal development.
          </p>
          <Link href="/player">
          <Button className="w-auto mx-auto my-10"
              variant="slim"
              >
              Get Started 🚀
          </Button>
          </Link>
        
      </div>
    
    <div className="mb-24 mx-6 sm:mx-6 md:mx-12 xl:mx-24 flex justify-center flex-col flex-wrap sm:flex-row">
    {players.map((player) => (
    <Avatar 
    statName = {player.full_name}    
    statLevel = {player.total_level}    
    statEXP = {player.total_exp}    
    statGold = {player.total_gold}  
    statWinName = {player.name}
    statWinType = {player.type}
    statWinGold = {player.gold_reward}
    statWinEXP = {player.exp_reward}  
    url = {player.avatar_url}
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