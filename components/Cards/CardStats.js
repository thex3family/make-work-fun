import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { createPopper } from '@popperjs/core';
import { useEffect, useState, createRef } from 'react';
import { Tooltip, Slider } from '@mantine/core';

export default function CardStats({
  statTitle,
  statName,
  statLevel,
  statMaxLevel,
  statEXP,
  statEXPProgress,
  statLevelEXP,
  statEXPPercent,
  statGold,
  statArrow,
  statPercent,
  statPercentColor,
  statDescription,
  statIconName,
  statIconColor,
  setShowTitleModal,
  statPlayer,
  displayMode
}) {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = createRef();
  const popoverDropdownRef = createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: 'bottom-start'
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  // Slider
  const [energyValue, setEnergyValue] = useState(50);
  const [energyEndValue, setEnergyEndValue] = useState(50);


  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words rounded mb-6 shadow-lg bg-primary-2">
        <div className="flex-auto p-4">
          <div className="flex flex-wrap">
            <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
              <button
                className="text-emerald-400 uppercase font-bold text-xs"
                onClick={() => {
                  setShowTitleModal ? setShowTitleModal(true) : null;
                }}
              >
                {statTitle ? statTitle : 'Newbie'}
              </button>
              <p className="font-semibold text-xl text-white-700">{statName}</p>
              <span className="font-semibold text-l text-white-700">
                Level {statLevel}
              </span>
              <span className="font-semibold text-l text-blueGray-700">
                &nbsp;/ {statMaxLevel}
              </span>
            </div>
            {displayMode !== 'demo' ?
              <div className="relative w-auto pl-4 flex-initial">
                <button
                  ref={btnDropdownRef}
                  onClick={() => {
                    dropdownPopoverShow
                      ? closeDropdownPopover()
                      : openDropdownPopover();
                  }}
                  className={
                    'cursor-pointer text-white p-3 text-center inline-flex items-center justify-center w-10 h-10 border shadow-lg rounded-full ' +
                    statIconColor
                  }
                >
                  <i className={statIconName}></i>
                </button>

                <div
                  ref={popoverDropdownRef}
                  className={
                    (dropdownPopoverShow ? 'block ' : 'hidden ') +
                    'bg-blueGray-900 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-36 '
                  }
                >
                  <Link href="/embed" target="_blank">
                    <a
                      target="_blank"
                      className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                    >
                      Copy Embed Link
                    </a>
                  </Link>
                  <Link href="/account" target="_blank">
                    <a
                      target="_blank"
                      className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
                    >
                      Go To Account
                    </a>
                  </Link>
                </div>
              </div> : null}
          </div>
          <div className="font-semibold text-sm text-right -mt-3">
            {statEXP} / {statLevelEXP - statEXPProgress + statEXP} XP
          </div>
          <div className="flex flex-wrap">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <div className="flex items-center">
                <span className="mr-2 text-emerald-500 ">
                  {statEXPPercent}%
                </span>
                <div className="relative w-full">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200">
                    <div
                      style={{ width: `${statEXPPercent}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="flex flex-row flex-nowrap items-center gap-4">

            <Tooltip
              className="mt-4 w-full text-center font-semibold border py-2 rounded"
              label="Item Shop Coming Soon!"
              withArrow
              arrowSize={3}
            >
              <div
                variant="slim"
                className=""
              >
                {statGold} 💰
              </div>
            </Tooltip>
            <Tooltip
              className="mt-4 w-full text-center font-semibold border py-2 rounded"
              label="Life Points Coming Soon!"
              withArrow
              arrowSize={3}
            >
              <div
                variant="slim"
              >
                0 💖
              </div>
            </Tooltip>
            {/* <Button disabled={true} variant="slim" className="mt-4 w-full sm:w-3/5">
              <span className={statPercentColor + " mr-2"}>
                <i
                  className={
                    statArrow === "up"
                      ? "fas fa-arrow-up"
                      : statArrow === "down"
                      ? "fas fa-arrow-down"
                      : ""
                  }
                ></i>{" "}
                {statPercent}%
              </span>
              <span className="whitespace-nowrap">{statDescription}</span>
            </Button> */}
          </div>
          <Slider
            value={energyValue} onChange={setEnergyValue} onChangeEnd={setEnergyEndValue}
            className='slider my-5'
            color="yellow"
            size="md"
            radius="md"
            showLabelOnHover={true}
            step={25}
            label={(value) => `Energy: ${value}`}
            marks={[
              { value: 0, label: '☠️' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '💛' },
            ]}
          />
        </div>
      </div>
    </>
  );
}

CardStats.defaultProps = {
  statTitle: 'Newbie',
  statName: 'No Name!',
  statLevel: '0',
  statMaxLevel: '100',
  statEXP: '0',
  statEXPToLevel: '100',
  statGold: '0',
  statArrow: 'up',
  statEXPPercent: '0',
  statPercent: 'Some',
  statPercentColor: 'text-emerald-500',
  statDescription: 'Since last month',
  statIconName: 'far fa-exclamation',
  statIconColor: 'bg-red-500'
};

CardStats.propTypes = {
  statTitle: PropTypes.string,
  statMaxLevel: PropTypes.number,
  statLevelEXP: PropTypes.number,
  statArrow: PropTypes.oneOf(['up', 'down']),
  statEXPPercent: PropTypes.number,
  statPercent: PropTypes.string,
  // can be any of the text color utilities
  // from tailwindcss
  statPercentColor: PropTypes.string,
  statDescription: PropTypes.string,
  statIconName: PropTypes.string,
  // can be any of the background color utilities
  // from tailwindcss
  statIconColor: PropTypes.string
};
