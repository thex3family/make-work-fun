import UpdateNotes from '@/utils/updates.json';
let latestUpdate = UpdateNotes[0];
import CardUpdate from '@/components/Cards/CardUpdate';
import { Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';

export default function ModalUpdates({ user, userProfile }) {
    const [openModal, setOpenModal] = useState(true);
    const [updatesMissed, setUpdatesMissed] = useState(null);

    useEffect(() => {
        setUpdatesMissed(UpdateNotes[0].version - userProfile.latest_version)
    }, []);


    useEffect(() => {
        if(updatesMissed > 0) updateLatestVersion(latestUpdate)
    }, [updatesMissed]);

    async function updateLatestVersion({ version }) {
        try {

            let { error } = await supabase
                .from('users')
                .update({
                    latest_version: version
                })
                .eq('id', user.id);

            if (error) {
                throw error;
            }
        } catch (error) {
            // alert(error.message);
            console.log(error.message);
        } finally {
        }
    }

    if (updatesMissed > 0) {
        return (
            <Modal
                centered
                opened={openModal}
                onClose={() => setOpenModal(false)}
                classNames={{
                    modal: 'text-white bg-dark hideLinkBorder w-full md:w-2/3',
                    title: '',
                    close: '',
                }}
            >
                <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    What's New?
                </h1>
                <p className="text-xl text-accents-5 text-center sm:text-2xl max-w-2xl m-auto mb-6">
                    There has been {updatesMissed} updates since you last logged in.
                </p>
                <div className="timeline">
                    {UpdateNotes.slice(0, updatesMissed).map((update) => (
                        <CardUpdate
                            date={update.date}
                            title={update.title}
                            desc={update.desc}
                            img_url={update.img_url}
                            button_url={update.button_url}
                            version={update.version}
                        />
                    ))}
                </div>

            </Modal>

        );
    }

    return null;


}
