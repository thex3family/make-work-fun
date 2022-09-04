import { triggerCardWin } from '../Modals/ModalHandler';
import { useState, useEffect } from 'react';

import CardWin from '../Cards/CardWin';

import { supabase } from '@/utils/supabase-client';


export default function WinManage() {
    const [payload, setPayload] = useState(null);
    const [showCardWin, setShowCardWin] = useState(false);

    useEffect(() => {
        console.log('Checking for wins')
        const winSubscription = supabase
            .from('success_plan')
            .on('INSERT', async (payload) => {
                console.log('New Win Incoming!', payload, payload.new.player);
                setPayload(payload)
            })
            .subscribe();

        async function removeSubscription() {
            await supabase.removeSubscription(winSubscription);
        }

        console.log('winSubscription', winSubscription);

        return () => {
            console.log('Removing winSubscription');
            removeSubscription();
        }
    }, []);

    useEffect(() => {
        if (payload) {
            // show card win 
            console.log('User not signed in');
            triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
        }
    }, [payload]);

    return (
        <>
            {/* Card Win */}
            {showCardWin ? (
                <CardWin
                    setShowCardWin={setShowCardWin}
                    win={activeWinStats}
                    player_name={showCardWin.full_name}
                    avatarUrl={showCardWin.avatar_url}
                />
            ) : null}

        </>
    );
}