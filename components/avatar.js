import { useEffect, useState, createRef } from 'react';
import { uploadImage } from '@/utils/uploadImage';
import LoadingDots from '@/components/ui/LoadingDots';
import { createPopper } from '@popperjs/core';

export default function Avatar({ avatarUrl, size, onAvatarUpload, onBackgroundUpload, showHide, setShowHide }) {
  const [uploading, setUploading] = useState(false);
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

  async function uploadAvatar(event) {
    setUploading(true);
    const result = await uploadImage('avatars', event.target.files?.[0]);
    setUploading(false);
    if (result.ok) onAvatarUpload(result.path);
    else alert(result.error);
  }

  async function uploadBackground(event) {
    setUploading(true);
    const result = await uploadImage('backgrounds', event.target.files?.[0]);
    setUploading(false);
    if (result.ok) onBackgroundUpload(result.path);
    else alert(result.error);
  }

  return (
    <div>
      {avatarUrl ? (
        <img
          className="avatar image h-40 sm:h-72 md:h-auto m-auto cursor-pointer"
          src={avatarUrl}
          alt="Avatar"
          onClick={() => {
            showHide ? setShowHide(false) : setShowHide(true);
          }}
        />
      ) : (
        <img
          className="avatar image h-40 sm:h-72 md:h-auto m-auto cursor-pointer"
          src="/img/default_avatar.png"
          alt="Avatar"
          onClick={() => {
            showHide ? setShowHide(false) : setShowHide(true);
          }}
        />
      ) }
      {/* {avatarUrl ? (
        <img
          className="avatar image m-auto"
          src={avatarUrl}
          alt="Avatar"
          style={{ height: size, width: size }}
        />
      ) : (
        <img className="avatar image m-auto" src='img/default_avatar.png' style={{ height: size, width: size }}/>
      )} */}
      <button
        className="font-bold button primary block cursor-pointer py-2 rounded bg-gradient-to-r from-emerald-500 outline-none to-blue-500 mt-6 w-1/2 md:w-full lg:w-1/2 mx-auto focus:outline-none"
        type="button"
        ref={btnDropdownRef}
        onClick={() => {
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        Personalize ✨
      </button>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? 'absolute ' : 'hidden ') +
          'bg-blueGray-900 text-base z-50 float-left py-2 list-none text-left rounded shadow-lg mt-1 w-1/3'
        }
      >
        <div className="" style={{ width: size }}>
          <label
            className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
            htmlFor="avatar"
          >
            {uploading ? 'Uploading ...' : 'Avatar'}
          </label>
          <input
            type="file"
            id="avatar"
            className="hidden"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </div>
        <div className="" style={{ width: size }}>
          <label
            className="cursor-pointer text-sm py-2 px-4 font-semibold block w-full whitespace-no-wrap bg-transparent text-white hover:bg-blueGray-600"
            htmlFor="background"
          >
            {uploading ? 'Uploading ...' : 'Background'}
          </label>
          <input
            type="file"
            id="background"
            className="hidden"
            accept="image/*"
            onChange={uploadBackground}
            disabled={uploading}
          />
        </div>
      </div>
      {/* <div className="" style={{ width: size }}>
        <label className="font-bold button primary block cursor-pointer py-2 rounded bg-gradient-to-r from-emerald-500 to-blue-500 mt-6 w-1/2 md:w-full lg:w-1/2 mx-auto" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Personalize ✨'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'relative',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div> */}
    </div>
  );
}
