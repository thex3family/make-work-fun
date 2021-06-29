import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';
import Countdown from '@/components/Widgets/Countdown/countdown';
import { getLeaderboardStats } from '@/utils/supabase-client';

export default function HomePage({ players }) {
  return (
    <section className="justify-center">
      <div className="bg-player-pattern bg-fixed h-4/5">
        <div className="bg-black bg-opacity-90 h-4/5">
          <div class="pt-8 md:pt-24 pb-10 max-w-7xl mx-auto">
            <div class="px-8 lg:container lg:px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
              <div class="flex flex-col w-full md:w-2/5 justify-center items-start text-center md:text-left">
                <h1 className="mx-auto md:mx-0 text-4xl font-extrabold sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                  Join Our Family
                </h1>
                <p className="mx-auto md:mx-0 text-xl text-accents-6 sm:text-2xl max-w-2xl">
                  Unlock multiplayer for personal development.
                </p>
                <div className="inline-block mx-auto md:mx-0">
                  <a href="https://makeworkfun.club" target="_blank">
                    <Button
                      className="w-auto mx-auto mr-5 my-4"
                      variant="incognito"
                    >
                      Learn More
                    </Button>
                  </a>
                  <Link href="/player">
                    <Button
                      className="w-auto mx-auto md:mx-0"
                      variant="prominent"
                    >
                      Get Started 🚀
                    </Button>
                  </Link>
                </div>
              </div>
              <div class="w-full md:w-3/5 py-6 text-center">
                <div className="max-w-6xl md:w-3/4 lg:w-full xl:w-3/4 mx-auto py-8 px-4 sm:px-6 lg:px-8 my-auto flex flex-col bg-black bg-opacity-50 rounded-lg">
                  <h1 className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                    Season 1 Starts In...
                  </h1>
                  <h1 className="rounded-lg pt-5 w-3/4 lg:w-full mx-auto text-xl font-semibold text-center lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
                    <Countdown date="2021-07-02T21:00:00-05:00" />
                  </h1>
                  {/* <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
          Unlock multiplayer for personal development.
        </p> */}
                  {/* <Link href="/player">
          <Button className="w-auto mx-auto my-10" variant="prominent">
            Get Started 🚀
          </Button>
        </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div class="relative -mt-12 lg:-mt-24">
        <svg
          viewBox="0 0 1428 174"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g
              transform="translate(-2.000000, 44.000000)"
              fill="#FFFFFF"
              fill-rule="nonzero"
            >
              <path
                d="M0,0 C90.7283404,0.927527913 147.912752,27.187927 291.910178,59.9119003 C387.908462,81.7278826 543.605069,89.334785 759,82.7326078 C469.336065,156.254352 216.336065,153.6679 0,74.9732496"
                opacity="0.100000001"
              ></path>
              <path
                d="M100,104.708498 C277.413333,72.2345949 426.147877,52.5246657 546.203633,45.5787101 C666.259389,38.6327546 810.524845,41.7979068 979,55.0741668 C931.069965,56.122511 810.303266,74.8455141 616.699903,111.243176 C423.096539,147.640838 250.863238,145.462612 100,104.708498 Z"
                opacity="0.100000001"
              ></path>
              <path
                d="M1046,51.6521276 C1130.83045,29.328812 1279.08318,17.607883 1439,40.1656806 L1439,120 C1271.17211,77.9435312 1140.17211,55.1609071 1046,51.6521276 Z"
                id="Path-4"
                opacity="0.200000003"
              ></path>
            </g>
            <g
              transform="translate(-4.000000, 76.000000)"
              fill="#000000"
              fill-rule="nonzero"
            >
              <path d="M0.457,34.035 C57.086,53.198 98.208,65.809 123.822,71.865 C181.454,85.495 234.295,90.29 272.033,93.459 C311.355,96.759 396.635,95.801 461.025,91.663 C486.76,90.01 518.727,86.372 556.926,80.752 C595.747,74.596 622.372,70.008 636.799,66.991 C663.913,61.324 712.501,49.503 727.605,46.128 C780.47,34.317 818.839,22.532 856.324,15.904 C922.689,4.169 955.676,2.522 1011.185,0.432 C1060.705,1.477 1097.39,3.129 1121.236,5.387 C1161.703,9.219 1208.621,17.821 1235.4,22.304 C1285.855,30.748 1354.351,47.432 1440.886,72.354 L1441.191,104.352 L1.121,104.031 L0.457,34.035 Z"></path>
            </g>
          </g>
        </svg>
      </div> */}
      <h1 className="text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-3 sm:p-4">
        Leaderboard 🏆
      </h1>
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
