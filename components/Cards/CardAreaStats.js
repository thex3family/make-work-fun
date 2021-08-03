import React from 'react';

function LevelBar({ title, level, exp_progress, level_exp, color }) {
  const exp_percent = Math.floor((exp_progress / level_exp) * 100);
  let bg500 = `bg-${color}-500`;
  let bg200 = `bg-${color}-200`
  let text500 = `text-${color}-500`

  return (
    <>
      <div className="mb-3">
        <div className="flex flex-row mb-1 justify-between">
          <span
            className={`font-semibold text-l text-white-700 px-1.5 py-0.5 ${bg500} rounded mr-2`}
          >
            {title ? title : 'Uncategorized'}
          </span>
          <span className="font-semibold text-l text-white-700">
            LVL: {level}
          </span>
        </div>
        {/* <div className="font-semibold text-sm text-right -mt-3">
      100 / 200 XP
    </div> */}
        <div className="flex flex-wrap">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <div className="flex items-center">
              <span className={`mr-2  ${text500} `}>{exp_percent}%</span>
              <div className="relative w-full">
                <div
                  className={`overflow-hidden h-2 text-xs flex rounded  ${bg200}`}
                >
                  <div
                    style={{ width: `${exp_percent}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${bg500}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CardAreaStats({ areaStats }) {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words rounded shadow-lg bg-primary-2 cursor-pointer">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <h5 className="text-left text-emerald-400 uppercase font-bold text-xs">
                Areas
              </h5>
              <div>
              <p className="text-left font-semibold text-xl text-white-700 mb-4">
                Life Progression <a href="https://academy.co-x3.com" target="_blank" className="absolute ml-1.5 mt-2 text-sm fas fa-question-circle" />
              </p>
              </div>
              {areaStats.map((stat) => (
                <LevelBar
                  title={stat.area}
                  level={stat.current_level}
                  exp_progress={stat.exp_progress}
                  level_exp={stat.level_exp}
                  color={
                    areaStats.findIndex((x) => x.area === stat.area) == 0
                      ? 'emerald'
                      : areaStats.findIndex((x) => x.area === stat.area) == 1
                      ? 'blue'
                      : areaStats.findIndex((x) => x.area === stat.area) == 2
                      ? 'red'
                      : areaStats.findIndex((x) => x.area === stat.area) == 3
                      ? 'yellow'
                      : areaStats.findIndex((x) => x.area === stat.area) == 4
                      ? 'purple'
                      : areaStats.findIndex((x) => x.area === stat.area) == 5
                      ? 'pink'
                      : 'gray'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
