import React from 'react';

function truncateString(str, num) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...'
}

function LevelBar({ title, level, exp_progress, level_exp, color }) {
  const exp_percent = Math.floor((exp_progress / level_exp) * 100);

  return (
    <>
      <div className="mb-3">
        <div className="">
          <div className="flex flex-row mb-1 justify justify-between">
            <div className="flex flex-row">
              <div className="w-32 text-left">
            <div
              className={`truncate font-semibold text-l text-white-700 px-1.5 py-0.5 rounded mr-2 ${
                color == 0
                  ? 'bg-emerald-500'
                  : color == 1
                  ? 'bg-blue-500'
                  : color == 2
                  ? 'bg-red-500'
                  : color == 3
                  ? 'bg-yellow-500'
                  : color == 4
                  ? 'bg-purple-500'
                  : color == 5
                  ? 'bg-pink-500'
                  : 'gray'
              }`}
            >
              {title ? title : 'Uncategorized'}
            </div>
            </div>
            <div className="whitespace-nowrap text-left px-1.5 py-0.5 rounded bg-gray-700 text-sm">LVL {level}</div>
            </div>
            <div className={`font-semibold text-l text-white-700 text-sm align-middle hidden lg:block
            `}>
              {exp_progress} / {level_exp} XP
            </div>
          </div>
          {/* <div className="font-semibold text-sm text-right -mt-3">
      100 / 200 XP
    </div> */}
          <div className="flex flex-wrap">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <div className="flex items-center">
                <span
                className={`mr-2  ${
                  color == 0
                    ? 'text-emerald-500'
                    : color == 1
                    ? 'text-blue-500'
                    : color == 2
                    ? 'text-red-500'
                    : color == 3
                    ? 'text-yellow-500'
                    : color == 4
                    ? 'text-purple-500'
                    : color == 5
                    ? 'text-pink-500'
                    : 'gray'
                } `}
              >
                {exp_percent}%
              </span>
                <div className="relative w-full">
                  <div
                    className={`overflow-hidden h-2 text-xs flex rounded mt-2 mb-1  ${
                      color == 0
                        ? 'bg-emerald-200'
                        : color == 1
                        ? 'bg-blue-200'
                        : color == 2
                        ? 'bg-red-200'
                        : color == 3
                        ? 'bg-yellow-200'
                        : color == 4
                        ? 'bg-purple-200'
                        : color == 5
                        ? 'bg-pink-200'
                        : 'gray'
                    }`}
                  >
                    <div
                      style={{ width: `${exp_percent}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        color == 0
                          ? 'bg-emerald-500'
                          : color == 1
                          ? 'bg-blue-500'
                          : color == 2
                          ? 'bg-red-500'
                          : color == 3
                          ? 'bg-yellow-500'
                          : color == 4
                          ? 'bg-purple-500'
                          : color == 5
                          ? 'bg-pink-500'
                          : 'gray'
                      }`}
                    ></div>
                  </div>
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
                  Life Progression{' '}
                  <a
                    href="https://academy.co-x3.com"
                    target="_blank"
                    className="absolute ml-1.5 mt-2 text-sm fas fa-question-circle"
                  />
                </p>
              </div>
              {areaStats.map((stat) => (
                <LevelBar
                  title={stat.area}
                  level={stat.current_level}
                  exp_progress={stat.exp_progress}
                  level_exp={stat.level_exp}
                  color={areaStats.findIndex((x) => x.area === stat.area)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
