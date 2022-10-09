import UpdateNotes from '@/utils/updates.json';
let latestUpdate = UpdateNotes[0];
import CardUpdate from '@/components/Cards/CardUpdate';
import { Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import Link from 'next/link';
import Button from '../ui/Button';

export default function ModalUpdates({ user, userProfile }) {
    const [openModal, setOpenModal] = useState(true);
    const [updatesMissed, setUpdatesMissed] = useState(null);

    useEffect(() => {
        setUpdatesMissed(UpdateNotes[0].version - userProfile.latest_version)
    }, []);


    useEffect(() => {
        if (updatesMissed > 0) updateLatestVersion(latestUpdate)
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
                    modal: 'text-white bg-dark hideLinkBorder w-full max-w-4xl',
                    title: '',
                    close: '',
                }}
            >
                <div className='flex flex-col'>
                <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                    Whoa, there’s new stuff!
                </h1>
                <p className="text-xl text-accents-5 text-center sm:text-2xl max-w-2xl m-auto mb-6">
                    We've shared {updatesMissed > 1 ? updatesMissed + ' updates' : '1 update'} since you last logged in.
                </p>
                <div className="timeline grid grid-cols-1 md:grid-cols-3">
                    {UpdateNotes.slice(0, updatesMissed).map((update) => (
                        <CardUpdate
                            date={update.date}
                            title={update.title}
                            desc={update.desc}
                            desc2={update.desc2}
                            img_url={update.img_url}
                            button_url={update.button_url}
                            version={update.version}
                        />
                    ))}

                </div>
                <div className="mx-auto mt-5 mb-10">
                    <a 
                        href="/new"
                    >
                        <Button variant="prominent">
                            See All Updates
                        </Button>
                    </a>
                </div>
                </div>

            </Modal>

        );
    }

    return null;


}
