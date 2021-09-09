import React, { useEffect, useState, createRef } from 'react';
import { createPopper } from '@popperjs/core';

export default function AvatarMember({ member }) {
  const [popoverShow, setPopoverShow] = React.useState(false);
  const btnRef = React.createRef();
  const popoverRef = React.createRef();
  const openTooltip = () => {
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'bottom'
    });
    setPopoverShow(true);
  };
  const closeTooltip = () => {
    setPopoverShow(false);
  };
  return (
    <>
      <div
        className={`bg-cover bg-center object-cover rounded-full shadow-xl block w-8 h-8 -ml-3 overflow-hidden ${
          member.role == 'Party Leader'
            ? 'border-2 border-yellow-300'
            : 'border-2 border-gray-700'
        }`}
        style={{
          backgroundImage: `url(${member.background_url})`
        }}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        ref={btnRef}
      >
        <div className="bg-black bg-opacity-30 rounded-full w-8 h-8 p-0.5 flex items-center">
          <img
            className="avatar image mx-auto object-cover"
            src={`${
              member.avatar_url ? member.avatar_url : 'img/default_avatar.png'
            }`}
            alt="Avatar"
          />
        </div>
      </div>
      <div
        className={
          (popoverShow ? '' : 'hidden ') +
          'bg-blueGray-900 border-0 mr-3 block z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg'
        }
        ref={popoverRef}
      >
        <div>
          <div className="text-white p-3">{member.full_name}</div>
        </div>
      </div>
    </>
  );
}
