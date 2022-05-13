import { fetchLatestWin, fetchPlayerStats } from '../Fetch/fetchMaster';
import { triggerCardWin, triggerWinModal } from '../Modals/ModalHandler';
import { useState, useEffect } from 'react';
import { userContent } from '@/utils/useUser';

import ModalLevelUp from '../Modals/ModalLevelUp';
import WinModal from '../Modals/ModalWin';
import CardWin from '../Cards/CardWin';


export default function WinManage({setRefreshChildStats}) {
    // Handle Win Modal

    const { user } = userContent();
    const [levelUp, setLevelUp] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [activeModalStats, setActiveModalStats] = useState(null);
    const [activeWinStats, setActiveWinStats] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);
    const [showCardWin, setShowCardWin] = useState(false);

    // this also runs more times than it should

    // need to improve this, i think refactoring is necessary...
    useEffect(() => {
        fetchLatestWin(
            setActiveModalStats,
            refreshStats,
            setLevelUp,
            triggerWinModal,
            setShowWinModal,
            null,
            triggerCardWin,
            setShowCardWin,
            setActiveWinStats
        );
    }, [user]);


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