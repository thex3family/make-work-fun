import { fetchLatestWin, fetchPlayerStats } from '../Fetch/fetchMaster';
import { triggerCardWin, triggerWinModal } from '../Modals/ModalHandler';
import { useState, useEffect } from 'react';
import { userContent } from '@/utils/useUser';

import ModalLevelUp from '../Modals/ModalLevelUp';
import WinModal from '../Modals/ModalWin';
import CardWin from '../Cards/CardWin';

import { supabase } from '@/utils/supabase-client';


export default function WinManage({ user, setRefreshChildStats }) {
    // Handle Win Modal
    // const { user } = userContent();
    const [levelUp, setLevelUp] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [activeModalStats, setActiveModalStats] = useState(null);
    const [activeWinStats, setActiveWinStats] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);
    const [showCardWin, setShowCardWin] = useState(false);

    // this also runs more times than it should

    // need to improve this, i think refactoring is necessary...
    // basically this only runs once - so if you switch to a logged in state, it doesn't work properly until the next hard refresh. 

    // useEffect(() => {
    //     fetchLatestWin(
    //         setActiveModalStats,
    //         refreshStats,
    //         setLevelUp,
    //         triggerWinModal,
    //         setShowWinModal,
    //         null,
    //         triggerCardWin,
    //         setShowCardWin,
    //         setActiveWinStats
    //     );
    // }, []);

    useEffect(() => {
        console.log('Checking for wins for ' + user?.id)
        const winSubscription = supabase
            .from('success_plan')
            .on('INSERT', async (payload) => {
                console.log('New Win Incoming!', payload, payload.new.player);
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

    async function refreshStats() {
        setRefreshChildStats(true);
        setPlayerStats(await fetchPlayerStats());
    }

    if (user) return (
        <>
            {/* Level Up Modal */}
            {levelUp ? (
                <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
            ) : null}

            {/* // Win Modal */}
            {showWinModal ? (
                <>
                    <WinModal
                        page={'leaderboard'}
                        activeModalStats={activeModalStats}
                        setShowWinModal={setShowWinModal}
                        playerStats={playerStats}
                        refreshStats={refreshStats}
                    />
                </>
            ) : null}


        </>
    );

    if (!user) return (
        <>
            {/* Card Win */}
            {
                showCardWin ? (
                    <CardWin
                        setShowCardWin={setShowCardWin}
                        win={activeWinStats}
                        player_name={showCardWin.full_name}
                        avatarUrl={showCardWin.avatar_url}
                    />
                ) : null
            }</>
    );
}