import { downloadImage } from '@/utils/downloadImage';
import { useState, useEffect } from 'react';
import { fetchSpecificWins } from '../Fetch/fetchMaster';
import LoadingDots from '../ui/LoadingDots';

export default function AvatarPlayer({ player }) {
  
  const [avatarURL, setAvatarURL] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(
    '/background/cityscape.jpg'
  );

  useEffect(() => {
    loadAvatarURL();
    if (player.background_url) loadBackgroundURL();
  }, []);

  async function loadAvatarURL() {
    if (player.avatar_url) {
      setAvatarURL(await downloadImage(player.avatar_url, 'avatar'));
    } else {
      setAvatarURL('Missing');
    }
  }

  async function loadBackgroundURL() {
    setBackgroundUrl(await downloadImage(player.background_url, 'background'));
  }

  return (
    <>
      <div className="relative -mr-4">
        <div className="absolute -bottom-2 inset-x-0">
      <i className={` ${player.role == "Party Leader" ? "text-yellow-500 fas fa-crown" : null}`}/>
          </div><div
            className="bg-cover bg-center object-cover rounded-full w-full h-full shadow-xl block border-4 border-gray-800"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            <div className="bg-black bg-opacity-70 h-full flex rounded-full">
              {avatarURL == 'Missing' ? (
                <img
                  className="avatar image  mx-auto object-cover rounded-full w-12 h-12"
                  src="img/default_avatar.png"
                  alt="Avatar"
                />
              ) : avatarURL ? (
                <img
                  className="avatar image mx-auto object-cover rounded-full w-12 h-12"
                  src={avatarURL}
                  alt="Avatar"
                />
              ) : (
                <div className="flex justify-center avatar image mx-auto px-2 object-contain">
                  <LoadingDots />
                </div>
              )}
            </div>
          </div>
          </div>
        
    </>
  );
}
