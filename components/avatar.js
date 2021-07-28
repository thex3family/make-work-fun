import { useEffect, useState, createRef } from 'react';
import { supabase } from '../utils/supabase-client';
import LoadingDots from '@/components/ui/LoadingDots';
import { createPopper } from '@popperjs/core';

export default function Avatar({ url, size, onAvatarUpload, onBackgroundUpload }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
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

  useEffect(() => {
    if (url) downloadImage(url);
    if (!url) setAvatarStatus('Missing');
  }, [url]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error.message);
    } finally {
      setAvatarStatus('Exists');
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onAvatarUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadBackground(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onBackgroundUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {avatarStatus == 'Exists' ? (
        <img
          className="avatar image h-32 sm:h-auto m-auto"
          src={avatarUrl}
          alt="Avatar"
        />
      ) : avatarStatus == 'Missing' ? (
        <img
          className="avatar image m-auto"
          src="img/default_avatar.png"
          alt="Avatar"
        />
      ) : (
        <div className="flex avatar image m-auto justify-center">
          <LoadingDots />
        </div>
      )}
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
          (dropdownPopoverShow ? 'block ' : 'hidden ') +
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
            style={{
              visibility: 'hidden',
              position: 'absolute'
            }}
            type="file"
            id="avatar"
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
            style={{
              visibility: 'hidden',
              position: 'absolute'
            }}
            type="file"
            id="background"
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
