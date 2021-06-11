import React from "react";
import Button from '@/components/ui/Button';
import Link from 'next/link';

// components

import CardStats from "components/Cards/CardStats.js";
import CardLineChart from "components/Cards/CardLineChart.js";

export default function HeaderStats({
  full_name,
  total_level,
  total_exp,
  total_gold,
})

{

  const level_exp = 500;
  const exp_percent = Math.round((total_exp / level_exp)*100);

  return (
    <>
      {/* Header */}
      <div className="relative md:pt-32 pb-16 pt-24">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap items-center">
              <div className="w-full pb-5 sm:w-1/4 lg:w-1/2 h-full text-center relative">
                <img
                    src="/img/avatar.png"
                    className="avatar mx-auto h-auto"
                    alt="..."
                ></img>
                
              <Button className="sm:w-auto mt-5 w-full"
                variant="slim"
                disabled={true}
                >
                Personalize ✨
              </Button>
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
                <Link href="/">
              <Button className="w-full"
                variant="slim"
                >
                See Leaderboard 🏆
              </Button>
              </Link>
              
              <div className="w-full pt-6">
              <CardLineChart/>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
