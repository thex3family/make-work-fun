import React from 'react';
import { useState, useEffect } from 'react';
import BottomNavbar from '@/components/ui/BottomNavbar/BottomNavbar';
import { supabase } from '../utils/supabase-client';
import { useUser } from '@/utils/useUser';
import { useRouter } from 'next/router';
import CardParty from '@/components/Cards/CardParty';
import Kanban from '@/components/Parties/Kanban';
import RecruitingBoard from '@/components/Parties/RecruitingBoard';

export default function parties() {
  const [activeParties, setActiveParties] = useState(null);
  const [recruitingParties, setRecruitingParties] = useState(null);
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
    fetchActiveParties().then((result) => {
      fetchRecruitingParties();
    });
  }

  async function fetchActiveParties() {
    try {
      const user = supabase.auth.user();

      // get the parties that the user is a part of and return the associated party properties instead
      // Note: Related table column values are returned as objects. ex. For the party's id, you will get { id: {id: 2} }
      const { data, error } = await supabase
        .from('party_members')
        .select(
          'id: party (id), name: party (name), challenge: party(challenge), description: party(description), due_date: party(due_date), status: party(status)'
        )
        .eq('player', user.id);

      //console.log('parties you are in:', data);

      // Put the data into the right format
      var parties_you_are_in = data.map((party) => {
        return {
          id: party.id.id,
          name: party.name.name,
          description: party.description.description,
          challenge: party.challenge.challenge,
          status: party.status.status
        };
      });

      // only use the parties that are in progress
      setActiveParties(parties_you_are_in.filter((party) => party.status == 2));

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

      party_members_avatar_urls = data.map((member) => {
        return member.player_avatar_url.avatar_url;
      });

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

  async function addChallengeNameAndMemberAvatars(recruitingParties) {
    for (var i = 0; i < recruitingParties.length; i++) {
      var tempParty = recruitingParties[i];
      var member_avatar_urls = await fetchPartyMemberAvatarURLs(tempParty.id);
      recruitingParties[i] = {
        ...tempParty,
        member_avatar_urls: member_avatar_urls
      };
    }

    return recruitingParties.map((party) => {
      return { ...party, challenge_name: party.challenge_name.name };
    });
  }

  async function fetchRecruitingParties() {
    try {
      const { data, error } = await supabase
        .from('party')
        .select(
          'id, name, challenge, description, due_date, status, challenge_name: party_challenge (name)'
        )
        .eq('status', 1);

      var recruitingParties = data;

      console.log('fetchRecruitingParties');

      recruitingParties = await addChallengeNameAndMemberAvatars(
        recruitingParties
      );

      //console.log('updated -', recruitingParties);
      console.log('RecruitingParties', recruitingParties)
      setRecruitingParties(recruitingParties);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setLoading(false);
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
                  ? activeParties.map((party) => (
                      <CardParty
                        key={party.id}
                        party={party}
                        avatar_urls={fetchPartyMemberAvatarURLs(party.id)}
                      />
                    ))
                  : "You aren't a part of any parties."
                : null}
            </section>
            <section>
              <h2 className="text-xl align-middle justify-center inline-flex font-bold text-dailies mt-4">
                Parties Recruiting
              </h2>
              {recruitingParties ? (
                <Kanban recruitingParties={recruitingParties} />
              ) : null}
              {recruitingParties ? (
                <RecruitingBoard recruitingParties={recruitingParties} />
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
