import { fetchPlayerStats } from '../Fetch/fetchMaster';
import { triggerCardWin, triggerWinModal } from '../Modals/ModalHandler';
import { useState, useEffect } from 'react';

import ModalLevelUp from '../Modals/ModalLevelUp';
import WinModal from '../Modals/ModalWin';
import CardWin from '../Cards/CardWin';

import { supabase } from '@/utils/supabase-client';
import notifyMe from '../Notify/win_notification';


export default function UserWinManage({ user, setRefreshChildStats }) {
    const [payload, setPayload] = useState(null);
    const [levelUp, setLevelUp] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [activeModalStats, setActiveModalStats] = useState(null);
    const [activeWinStats, setActiveWinStats] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);
    const [showCardWin, setShowCardWin] = useState(false);

    useEffect(() => {
        console.log('Checking for wins')
        const userWinSubscription = supabase
            .from('success_plan')
            .on('INSERT', async (payload) => {
                console.log('New Win Incoming!', payload, payload.new.player);
                setPayload(payload)
            })
            .subscribe();

        async function removeSubscription() {
            await supabase.removeSubscription(userWinSubscription);
        }

        console.log('userWinSubscription', userWinSubscription);

        return () => {
            console.log('Removing userWinSubscription');
            removeSubscription();
        }
    }, []);

    useEffect(() => {
        if (payload) {
            // checking if the win is assigned to the defined user
            if (payload.new.player === user.id) {
                // if true, show the winModal
                console.log('Win assigned to current user');

                // Get the latest updated stats of the user
                const player = fetchPlayerStats();

                // check if user leveled up
                if (player.current_level > player.previous_level) {
                    // level up animation
                    setLevelUp(player.current_level);
                    notifyMe('level', player.current_level);
                }

                // If win is from success plan, set up the modal
                // if(payload.new.type !== 'Daily Quest'){
                triggerWinModal(
                    setActiveModalStats,
                    setShowWinModal,
                    payload.new
                );

                notifyMe('win', payload.new);
                // }

            } else {
                // if false, show the cardWin
                console.log('Win not assigned to current user');
                triggerCardWin(setActiveWinStats, setShowCardWin, payload.new);
            }
        }
    }, [payload]);

    async function refreshStats() {
        setRefreshChildStats(true);
        setPlayerStats(await fetchPlayerStats());
    }

    return (
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