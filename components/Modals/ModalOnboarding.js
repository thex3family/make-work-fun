import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Router from 'next/router';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '../ui/LoadingDots';
import { seasonStartDate } from '@/utils/season';
import moment from 'moment';

// Matched on when checking whether this season's opening win already exists,
// so the name has to stay in sync with the row inserted below.
const SEASON_START_WIN = 'My First Win This Season';

export default function ModalOnboarding({ onboardingState, player }) {
  const [header, setHeader] = useState(null);
  const [description, setDescription] = useState(null);
  const [mediaLink, setMediaLink] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [steps, setSteps] = useState(null);
  const [customLink, setCustomLink] = useState(null);
  const [loading, setLoading] = useState(null);

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
      setHeader('Your Database Is Connected!');
      setDescription("It's time to hand in your first quest!");
      setSteps('hand-in')
      setMediaLink(
        'https://www.loom.com/embed/e5eaaa19fcf64297b2859ed7c64171ad'
      );
      setMediaType('iframe');
    } else if (onboardingState == 5) {
      setHeader("It's A Brand New Season!");
      setDescription("It's a new season for growth.");
      setSteps('new-season')
      setMediaLink('/img/new_season_motivation.png');
      setMediaType('img');
      setCustomLink('new-season')
    } else if (onboardingState == 'new_season_embed') {
      setHeader("It's A Brand New Season!");
      setDescription("It's a new season for growth.");
      setSteps('new-season')
      setCustomLink('new-season-embed')
    }
    else if (onboardingState == 'invalid_auth') {
      setHeader("⚠️ Your Authentication Link Is Invalid");
      setDescription("This may be because...");
      setSteps('invalid-auth')
      // setMediaLink(
      //   'https://www.loom.com/embed/e5eaaa19fcf64297b2859ed7c64171ad'
      // );
      // setMediaType('iframe');
      setCustomLink('invalid-auth')
    }
  }

  // Granted once per player per season.
  //
  // This used to insert unconditionally and then reload. The reload lands
  // before the new win is visible on the seasonal leaderboard, so the modal
  // comes straight back -- and players click it again. Recorded gaps between
  // repeat rows are 2-9 seconds, and it has produced 1,820 duplicate wins
  // across 686 player-seasons, one player reaching 42. The insert is now
  // guarded by a lookup so a repeat click costs nothing.
  async function startSeason() {
    try {
      setLoading(true);

      // only for signed in users
      const user = supabase.auth.user();

      if (!user) {
        throw new Error('You need to be signed in to start the season.');
      }

      const seasonStart = seasonStartDate();

      const { data: existing, error: lookupError } = await supabase
        .from('success_plan')
        .select('id')
        .eq('player', user.id)
        .eq('name', SEASON_START_WIN)
        .gte('closing_date', moment(seasonStart).format('YYYY-MM-DD'))
        .limit(1);

      if (lookupError) {
        throw lookupError;
      }

      if (existing && existing.length > 0) {
        return;
      }

      let testDateStr = new Date();

      const { error } = await supabase.from('success_plan').insert([
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
          name: SEASON_START_WIN
        }
      ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error.message);
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
                  {steps == 'hand-in' ? (
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
                  {steps == 'new-season' ? (
                    <ol className="text-sm text-black text-left sm:text-lg max-w-2xl m-auto px-0 sm:px-8 pt-6">
                      <li>
                        1. Your wins and titles are safe and secure with us
                      </li>
                      <li>2. Seasonal leaderboard rankings have been reset</li>
                      <li>
                        3. Climb your way to the top - <span className="font-semibold">
                          you got this!
                        </span>
                      </li>
                    </ol>
                  ) : null}
                  {steps == 'invalid-auth' ? (
                    <>
                      <ol className="text-sm text-black text-left sm:text-lg max-w-2xl m-auto px-0 sm:px-8 pt-6">
                        <li>
                          1. Your embed has been updated to a <a href="/new" className='text-emerald-600 font-semibold' target="_blank">new version</a>
                        </li>
                        <li>2. You have created a new secret embed link</li>
                      </ol>

                      <p className="text-lg text-primary-2 mt-5 font-semibold">
                        Get a new link by following the instructions below!
                      </p>
                    </>
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
                <div className="text-center mx-auto flex flex-col gap-2">
                  
                  {loading ? <LoadingDots/> : (customLink == 'new-season' ? 
                  <Button
                    variant="prominent"
                    className="text-md font-semibold text-emerald-600"
                    onClick={() => startSeason()}
                    disabled={loading}
                  >
                    Join The Adventure
                  </Button> : customLink == 'new-season-embed' ?
                    <a href="/player" target="_blank"><Button
                      variant="prominent"
                      className="text-md font-semibold text-emerald-600"
                    >
                      Go To Player Page
                    </Button></a> : customLink == 'invalid-auth' ? <a href="/embed" target="_blank"><Button
                      variant="prominent"
                      className="text-md font-semibold text-emerald-600"
                    >
                      Generate New Secret Embed Link
                    </Button></a> :
                      <>
                        <Link href="/account?tab=connect">
                          <Button
                            variant="prominent"
                            className="text-md font-semibold text-emerald-600"
                          >
                            Connect With A Productivity Tool
                          </Button>
                        </Link>
                        <button
                          variant="prominent"
                          className="text-md font-semibold text-emerald-600 hideLinkBorder"
                          onClick={() => startSeason()}
                          disabled={loading}
                        >
                          Skip For Now
                        </button>
                      </>)}


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
