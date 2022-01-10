import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Router from 'next/router';
import { supabase } from '@/utils/supabase-client';

export default function ModalOnboarding({ onboardingState }) {
  const [header, setHeader] = useState(null);
  const [description, setDescription] = useState(null);
  const [mediaLink, setMediaLink] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [handInSteps, setHandInSteps] = useState(null);
  const [newSeason, setNewSeason] = useState(null);
  const [customLink, setCustomLink] = useState(null);

  useEffect(() => {
    if (onboardingState) initializeDetails();
  }, [onboardingState]);

  async function initializeDetails() {
    if (onboardingState == 1) {
      setHeader("🔗 Let's Get Connected!");
      setDescription(
        'Our app helps you gamify your wins by connecting to productivity tools like Notion.'
      );
      setMediaLink('updates/0.16.gif');
      setMediaType('img');
      // set video link in the future here

      // don't need onboarding state = 2 because it is the case where only API key is saved (can't happen anymore)
    } else if (onboardingState == 3) {
      setHeader('⚔ Your Database Is Connected!');
      setDescription("It's time to hand in your first quest!");
      setHandInSteps(true);
      setMediaLink(
        'https://www.loom.com/embed/e5eaaa19fcf64297b2859ed7c64171ad'
      );
      setMediaType('iframe');
    } else if (onboardingState == 5) {
      setHeader("⚔ It's A Brand New Season!");
      setDescription("It's a new season for learning and growth.");
      setNewSeason(true);
      setMediaLink('img/new_season_motivation.png');
      setMediaType('img');
      setCustomLink('Join The Adventure')
    }
  }

  async function startSeason(){
      try {
        const user = supabase.auth.user();
  
        let testDateStr = new Date();
        // console.log('testDateStr: ' + testDateStr);
  
        const { data, error } = await supabase.from('success_plan').insert([
          {
            player: user.id,
            difficulty: 1,
            do_date: testDateStr,
            closing_date: testDateStr,
            trend: 'check',
            type: 'Bonus',
            punctuality: 0,
            exp_reward: 25,
            gold_reward: 25,
            name: 'My First Win This Season'
          }
        ]);
        if (error && status !== 406) {
          throw error;
        }
      } catch (error) {
        alert(error.message);
      } finally {
        Router.reload(window.location.pathname)
      }
    
  }

  return (
    <>
      <div className="animate-fade-in h-screen flex justify-center">
        <div
          className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
        >
          <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
          <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen z-50">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  {header}
                </h3>
              </div>
              {/*body*/}
              <div className="relative p-6 text-blueGray-500">
                <div className="text-center">
                  <p className="text-xl text-primary-2 font-semibold">
                    {description}
                  </p>
                  {handInSteps ? (
                    <ol className="text-sm text-black text-left sm:text-lg max-w-2xl m-auto px-0 sm:px-8 pt-6">
                      <li>
                        1. Make sure the required properties have been set
                      </li>
                      <li>2. Utilize optional properties to get more value</li>
                      <li>
                        3. Hand in your quest by marking{' '}
                        <span className="font-semibold">
                          ✔ Share With Family
                        </span>
                      </li>
                    </ol>
                  ) : null}
                  {newSeason ? (
                    <ol className="text-sm text-black text-left sm:text-lg max-w-2xl m-auto px-0 sm:px-8 pt-6">
                      <li>
                        1. Your wins and titles are safe and secure with us
                      </li>
                      <li>2. Seasonal leaderboard rankings have been reset</li>
                      <li>
                        3. Climb your way to the top this season! <span className="font-semibold">
                        You can do it!
                        </span>
                      </li>
                    </ol>
                  ) : null}
                </div>
              </div>
              {mediaType == 'iframe' ? (
                <iframe
                  className="w-full"
                  height="315"
                  src={mediaLink}
                  title="How To Hand In Quests"
                  frameborder="0"
                  allow="accelerometer; 
                    autoplay; 
                    clipboard-write; 
                    encrypted-media; 
                    gyroscope; 
                    picture-in-picture"
                ></iframe>
              ) : mediaType == 'img' ? (
                <img className="m-auto w-full" src={mediaLink} />
              ) : null}
              {/* <img src="img/default_avatar.png" height="auto" className="w-3/4 mx-auto pb-2" /> */}
              {/*footer*/}
              <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                <div className="text-center mx-auto">
                  {customLink ? <Button
                      variant="prominent"
                      className="text-md font-semibold text-emerald-600"
                      onClick={()=>startSeason()}
                    >
                      {customLink}
                    </Button> : <Link href="/account">
                    <Button
                      variant="prominent"
                      className="text-md font-semibold text-emerald-600"
                    >
                      Go To Account
                    </Button>
                  </Link>}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
