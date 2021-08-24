import { useState, useEffect } from 'react';
import LoadingDots from '../ui/LoadingDots';

function truncateString(str, num) {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...'
}

export default function CardWin({
  setShowCardWin,
  win,
  player_name,
  avatarUrl,
}) {
  //   const [hideWin, setHideWin] = useState(false);
  const [progress, setProgress] = useState(false);
  var width = 1;

  useEffect(() => {
    setInterval(function () {
      frame();
    }, 50);
  }, []);

  function frame() {
    if (width < 100) {
      width++;
      setProgress(width);
    } else {
      setShowCardWin(false);
    }
  }

  let short_name = truncateString(player_name, 10)

  //   if (hideWin) {
  //     return null;
  //   }

  return (
    <div className="ml-5 mr-5 mt-24 fixed right-0 top-0 text-xs font-semibold uppercase rounded-tl-md rounded-tr-md bg-gradient-to-r from-emerald-500 to-blue-500 filter shadow-xl opacity-50 hover:opacity-100 transition duration-400 ease-in-out">
      <div className="mt-2 mx-2 flex flex-row items-center py-1 px-2">
        {avatarUrl ? 
          <img
            className="avatar image m-auto mr-2 object-cover pb-2"
            src={avatarUrl}
            alt="Avatar"
            height="80"
            width="80"
          />
         : 
          <img
            className="avatar image m-auto mr-2 object-cover"
            src="img/default_avatar.png"
            alt="Avatar"
            height="80"
            width="80"
          />
        }
        <div className="">
          <p className="text-white text-sm font-semibold w-full">
            🎉 {short_name} just shared a win!
            <i className="cursor-pointer ml-3 text-base fas fa-times" onClick={()=>setShowCardWin(false)}/>
          </p>
          <p className="text-xs my-2">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-lightBlue-700 bg-lightBlue-200 last:mr-0 mr-1">
              {win.type}
            </span>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-yellow-600 bg-yellow-200 last:mr-0 mr-1">
              +{win.gold_reward} 💰{' '}
            </span>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200 last:mr-0 mr-1">
              +{win.exp_reward} XP
            </span>
          </p>
        </div>
      </div>
      <div className="relative w-full">
        <div className="overflow-hidden h-2 text-xs flex bg-white">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-blue-500"
          ></div>
        </div>
      </div>
    </div>
  );
}
