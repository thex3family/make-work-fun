import React from 'react';
import { useState } from 'react';

// components

import CardStats from 'components/Cards/CardStats.js';
import CardLineChart from 'components/Cards/CardLineChart.js';
import Avatar from '@/components/avatar';
import CardAreaStats from '@/components/Cards/CardAreaStats';
import { downloadImage } from '@/utils/downloadImage';

export default function HeaderStats({
  playerStats,
  avatarUrl,
  setAvatarUrl,
  fetchPlayerBackground,
  updateProfile,
  weekWins,
  areaStats,
  setShowTitleModal,
  user_id,
  refreshStats
}) {
  const exp_percent = Math.floor(
    (playerStats.exp_progress / playerStats.level_exp) * 100
  );
  const [showHide, setShowHide] = useState(true);

  async function handleAvatarUpload(url){
    setAvatarUrl(await downloadImage(url, 'avatar'));
    updateProfile({ image_url: url, type: 'avatar' });
  }

  return (
    <>
      {/* Header */}
      <div className="relative md:pt-32 pb-16 pt-24">
        <div className="px-4 md:px-0 lg:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
              <div className="w-full mx-auto mt-2 md:mt-0 mb-6 md:mb-0 xs:w-1/4 md:w-2/3 lg:w-1/2 h-full text-center relative">
                <div
                  className={`${showHide ? 'hidden' : ''} animate-fade-in`}
                  onClick={() => {
                    showHide ? setShowHide(false) : setShowHide(true);
                  }}
                >
                  <CardAreaStats areaStats={areaStats} />
                </div>
                <div data-intercom-target="avatar" className={`${showHide ? '' : 'hidden'} animate-fade-in`}>
                  <Avatar
                    avatarUrl={avatarUrl}
                    onAvatarUpload={(url) => handleAvatarUpload(url)}
                    onBackgroundUpload={(url) => {
                      fetchPlayerBackground(url);
                      updateProfile({ image_url: url, type: 'background' });
                    }}
                    showHide={showHide}
                    setShowHide={setShowHide}
                  />
                </div>
              </div>
              <div className="flex-grow w-full sm:w-2/3 sm:items-right lg:w-1/2 h-full py-0 sm:py-5">
                <CardStats
                  statTitle={playerStats.title}
                  statName={playerStats.full_name}
                  statLevel={playerStats.current_level}
                  statMaxLevel={100}
                  statEXP={playerStats.total_exp}
                  statLevelEXP={playerStats.level_exp}
                  statEXPProgress={playerStats.exp_progress}
                  statEXPPercent={exp_percent}
                  statGold={playerStats.total_gold}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-white"
                  statDescription="since last week"
                  statIconName="fas fa-cogs"
                  statIconColor="bg-transparent-500"
                  setShowTitleModal={setShowTitleModal}
                  statPlayer={playerStats.player}
                  statEnergy={playerStats.energy_level}
                  user_id={user_id}
                  refreshStats={refreshStats}
                />
                {/* <Link href="/">
              <Button className="w-full"
                variant="slim"
                >
                See Leaderboard 🏆
              </Button>
              </Link> */}

                <div className="w-full pt-6">
                  {weekWins ? <CardLineChart weekWins={weekWins} /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
