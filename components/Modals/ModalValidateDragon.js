import { useEffect, useState } from 'react';
import { fetchNotionCredentials } from '../Fetch/fetchMaster';
import { supabase } from '@/utils/supabase-client';
import router from 'next/router';

export default function ValidateDragon({
  specificPartyPlayer,
  setShowValidateDragon
}) {
  const [notionCredentials, setNotionCredentials] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    getNotionCredentials();
  }, []);

  async function getNotionCredentials() {
    setNotionCredentials(await fetchNotionCredentials());
  }

  async function updateTestCredentials(credential_id, party_member_id) {
    setSaving(true);
    const user = supabase.auth.user();
    // set the test pair
    const { data, error } = await supabase
      .from('notion_credentials_validation')
      .upsert({
        player: user.id,
        test_pair: credential_id,
        test_member: party_member_id
      })
      .eq('player', user.id);

    router.push('/notion-page-validator');
  }

  return (
    <div className="h-screen flex justify-center">
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-40 outline-none focus:outline-none">
        <div className="animate-fade-in-up relative w-auto my-6 mx-auto max-w-xl max-h-screen">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                Which database does this dragon reside in?
              </h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => closeModal()}
              >
                <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            {/*body*/}
            <div className="my-3 mx-2 text-black">
              <div className="flex flex-col gap-3">
                {notionCredentials
                  ? notionCredentials.map((credentials) => (
                      <button
                        className="border-2 border-emerald-500 p-4 rounded cursor-pointer hover:bg-emerald-300"
                        onClick={() =>
                          updateTestCredentials(
                            credentials.id,
                            specificPartyPlayer.party_member_id
                          )
                        }
                        disabled={saving}
                      >
                        <div className="text-lg font-semibold">
                          {credentials.nickname}
                        </div>
                        <div>{credentials.database_id}</div>
                      </button>
                    ))
                  : null}
              </div>
            </div>

            {/*footer*/}
            <div className="flex items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => setShowValidateDragon(false)}
              >
                Close
              </button>
              {/* <button
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  Save
                </button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-30 bg-black"></div>
    </div>
  );
}
