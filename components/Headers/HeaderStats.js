import React from "react";
import Button from '@/components/ui/Button';
import Link from 'next/link';

// components

import CardStats from "components/Cards/CardStats.js";
import CardLineChart from "components/Cards/CardLineChart.js";
import Avatar from '@/components/avatar';

export default function HeaderStats({
  full_name,
  total_level,
  total_gold,
  total_exp,
  avatar_url,
  setAvatarUrl,
  updateProfile,
  weekWins,
})

{

  const level_exp = 500*(total_level+1);
  const exp_percent =  Math.round(((total_exp - (total_level * 500)) / level_exp)*100);

  return (
    <>
      {/* Header */}
      <div className="relative md:pt-32 pb-16 pt-24">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
              <div className="w-full mx-auto pb-5 xs:w-1/4 sm:w-2/3 lg:w-1/2 h-full text-center relative">
                
      <Avatar className="avatar mx-auto h-auto"
        url={avatar_url}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({ avatar_url: url })
        }}
      />
              </div>
              <div className="flex-grow w-full sm:w-2/3 sm:ml-10 lg:ml-0 sm:items-right lg:w-1/2 h-full">
                <CardStats
                  statTitle="Newbie"
                  statName={full_name}
                  statLevel={total_level}
                  statMaxLevel={100}
                  statEXP={total_exp}
                  statLevelEXP={level_exp}
                  statEXPPercent={exp_percent}
                  statGold={total_gold}
                  statArrow="up"
                  statPercent="0"
                  statPercentColor="text-white"
                  statDescription="since last week"
                  statIconName="fas fa-cogs"
                  statIconColor="bg-transparent-500"
                />
                {/* <Link href="/">
              <Button className="w-full"
                variant="slim"
                >
                See Leaderboard 🏆
              </Button>
              </Link> */}
              
              <div className="w-full pt-6">
              <CardLineChart weekWins={weekWins}/>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
