import React from 'react';
import { useState, useEffect } from 'react';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { supabase } from '../utils/supabase-client';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import CardParty from '@/components/Cards/CardParty';

export default function parties() {
  const [activeParties, setActiveParties] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const {
    userLoaded,
    session,
    userDetails,
    userOnboarding,
    subscription
  } = useUser();

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  function initializePlayer() {
    try {
      if (userOnboarding.onboarding_state.includes('4')) {
        loadPlayer();
      } else {
        router.replace('/account');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  // If player is ready to load, go for it!

  async function loadPlayer() {
    console.log('Loading Player');
    fetchActiveParties();
  }

  async function getActiveParties(parties_you_are_in) {
    var temp_active_parties = [];
    try {
      // get the parties that are in progress and determine which or if any of these parties are in progress
      const { data, error } = await supabase
        .from('party')
        .select('*')
        .eq('status', 2);

      var in_progress_parties = data;

      //console.log('In Progress Parties:', in_progress_parties);

      // find the in_progress parties that you are a part of
      if (in_progress_parties.length != 0) {
        // compare parties you are in with in_progress parties to see which of your parties are in progress
        for (var i = 0; i < parties_you_are_in.length; i++) {
          for (var j = 0; j < in_progress_parties.length; j++) {
            if (parties_you_are_in[i].party_id == in_progress_parties[j].id) {
              temp_active_parties.push(in_progress_parties[j]);
            }
          }
        }
      }
      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      //console.log('Active Parties:', temp_active_parties);
      return temp_active_parties;
    }
  }

  async function fetchActiveParties() {
    try {
      const user = supabase.auth.user();

      // get the parties that the user is a part of
      const { data, error } = await supabase
        .from('party_members')
        .select('*')
        .eq('player', user.id);

      var parties_you_are_in = data;

      //console.log('Parties you are in:', parties_you_are_in);
      //console.log('Player Id:', user.id);

      setActiveParties(await getActiveParties(parties_you_are_in));

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
    }
  }

  async function fetchPartyMemberAvatarURLs(party_id) {
    var party_members_avatar_urls = [];

    try {
      const { data, error } = await supabase
        .from('party_members')
        .select('player_avatar_url: users (avatar_url)')
        .eq('party_id', party_id);

        party_members_avatar_urls = data;

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
      return party_members_avatar_urls;
    }
  }

  return (
    <section className="animate-slow-fade-in justify-center bg-dailies-pattern bg-fixed bg-cover">
      <BottomNavbar />
      <div className=" max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="animate-fade-in-up bg-dailies-default rounded p-10 opacity-90">
          <div className="pb-5">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl text-dailies pb-5">
              Parties
            </h1>
          </div>
          <div className="text-center">
            <section>
              <h2 className="text-xl align-middle justify-center inline-flex font-bold text-dailies">
                Your Active Party
              </h2>
              {activeParties
                ? activeParties.length != 0
                  ? activeParties.map((party) => <CardParty key={party.id} party={party} avatar_urls={fetchPartyMemberAvatarURLs(party.id)}/>)
                  : "You aren't a part of any parties."
                : null}
            </section>
            <section>
              <h2 className="text-xl align-middle justify-center inline-flex font-bold text-dailies mt-4">
                Parties Recruiting
              </h2>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
