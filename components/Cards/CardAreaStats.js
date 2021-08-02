import React from 'react';

function LevelBar({ title, level, percentage, color }) {
  return (
    <>
      <div className="mb-3">
        <div className="flex flex-row mb-1 justify-between">
          <span
            className={`font-semibold text-l text-white-700 px-1.5 py-0.5 bg-${color}-500 rounded mr-2`}
          >
            {title}
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
              <span className={`mr-2 text-${color}-500 `}>{percentage}</span>
              <div className="relative w-full">
                <div
                  className={`overflow-hidden h-2 text-xs flex rounded bg-${color}-200`}
                >
                  <div
                    style={{ width: `${percentage}` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500`}
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

export default function CardStats() {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words rounded shadow-lg bg-primary-2 mt-2 cursor-pointer">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <h5 className="text-left text-emerald-400 uppercase font-bold text-xs">
                Areas
              </h5>
              <p className="text-left font-semibold text-xl text-white-700 mb-4">
                Life Progression
              </p>

              <LevelBar
                title="Mindset"
                level={11}
                percentage="29%"
                color="emerald"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
