import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '@/components/ui/Input';
import { generateSlug } from 'random-word-slugs';
import { supabase } from '@/utils/supabase-client';
import { useRouter } from 'next/router';

export default function ModalParty({ setCreateParty, party }) {
  const [partyID, setPartyID] = useState(null);
  const [partyName, setPartyName] = useState(null);
  const [partyDescription, setPartyDescription] = useState(null);
  const [partyChallenge, setPartyChallenge] = useState(1);
  const [newParty, setNewParty] = useState(true);
  const [saving, setSaving] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (party) loadPartyDetails();
  }, []);

  async function loadPartyDetails() {
    setNewParty(false);
    setPartyID(party.id);
    setPartyName(party.name);
    setPartyDescription(party.description);
    setPartyChallenge(party.challenge);
  }

  async function saveParty(id, name, description, challenge) {
    setSaving(true);

    // if create new party
    if (newParty) {
      try {
        const user = supabase.auth.user();

        // will this generate immediately or do I need an await
        const slug = await generateSlug();

        let { data, error } = await supabase.from('party').insert([
          {
            name: name,
            description: description,
            challenge: challenge,
            status: '1',
            slug: slug,
            created_by: user.id
          }
        ]);

        console.log(data, error);
        console.log(data[0]);

        const party_id = data[0].id;

        // add party leader (but I don't know the party ID since I just created it...)

        await supabase.from('party_members').insert([
          {
            party_id: party_id,
            player: user.id,
            role: 'Party Leader'
          }
        ]);
        router.push('/parties/details?id='+slug)

      } catch (error) {
        alert(error.message);
      } finally {
        setSaving(false);
      }
    } else {
      // just updating existing entries (not allowing changing challenge)
      try {
        const { data, error } = await supabase
          .from('party')
          .update({
            name: name,
            description: description,
            challenge: challenge
          })
          .eq('id', id);

          router.reload(window.location.pathname)
      } catch (error) {
        alert(error.message);
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <>
      <div className="h-screen flex justify-center">
        <div
          className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          // onClick={() => setShowModal(false)}
        >
          <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  {newParty ? 'Create' : 'Edit'} Your Party
                </h3>
              </div>
              {/*body*/}
              <div className="relative p-6 text-primary-2 00">
                <div className="text-center">
                  <p className="text-xl text-primary-2 font-semibold">
                    Let's make your dream party possible.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-5 mt-5">
                  <div className="col-span-1">
                    <div className="mb-2 font-semibold">Party Name</div>
                    <Input
                      className="text-xl font-semibold rounded"
                      variant="dailies"
                      type="text"
                      disabled={saving}
                      value={partyName || ''}
                      onChange={setPartyName}
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="mb-2 font-semibold">
                      Party Challenge
                      <a
                        href="https://academy.co-x3.com/en/articles/5476321-attributing-your-wins-to-areas-of-competence/?utm_source=makeworkfun"
                        target="_blank"
                        className="absolute ml-1.5 mt-1.5 text-sm fas fa-question-circle"
                      />
                    </div>
                    <select
                      id="challenge"
                      name="challenge"
                      disabled={saving}
                      className="text-xl font-semibold rounded py-2 px-3 w-full transition duration-150 ease-in-out border border-accents-3"
                      value={partyChallenge || ''}
                      onChange={(e) => {
                        setPartyChallenge(e.target.value);
                      }}
                    >
                      <option value="1">Time Challenge</option>
                      <option value="2">Slay Your Dragon</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="mb-2 font-semibold">Party Description</div>
                    <Input
                      className="text-xl font-semibold rounded"
                      type="text"
                      variant="dailies"
                      disabled={saving}
                      value={partyDescription || ''}
                      onChange={setPartyDescription}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setCreateParty(false)}
                >
                  Close
                </button>
                <button
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    saveParty(
                      partyID,
                      partyName,
                      partyDescription,
                      partyChallenge
                    )
                  }
                >
                  {saving ? 'Saving...' : newParty ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </div>
    </>
  );
}
