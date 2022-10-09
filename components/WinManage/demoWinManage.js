import { fetchPlayerStats } from '../Fetch/fetchMaster';
import { triggerCardWin, triggerWinModal } from '../Modals/ModalHandler';
import { useState, useEffect } from 'react';

import ModalLevelUp from '../Modals/ModalLevelUp';
import WinModal from '../Modals/ModalWin';
import CardWin from '../Cards/CardWin';

import { supabase } from '@/utils/supabase-client';
import notifyMe from '../Notify/win_notification';

import Button from '@/components/ui/Button';


export default function DemoWinManage({ win, lvl }) {
    const [levelUp, setLevelUp] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);
    const [activeWinStats, setActiveWinStats] = useState(null);
    const [playerStats, setPlayerStats] = useState(null);

    const demoModalStats = {
        area: 'Make Work Fun',
        closing_date: '2021-10-08',
        database_nickname: null,
        difficulty: 1,
        do_date: '2021-10-07',
        entered_on: '2021-10-07T16:19:54.619076Z',
        exp_reward: 25,
        gif_url: null,
        gold_reward: 25,
        health_reward: null,
        id: 0,
        impact: '10x 🔺',
        name: 'My First Win',
        notion_id: '',
        party_id: null,
        player: '',
        punctuality: +1,
        trend: 'up',
        type: 'Task',
        upstream: 'Starting My Adventure',
        upstream_id: ''
    };

    const [activeModalStats, setActiveModalStats] = useState(demoModalStats);

    async function refreshStats() {
        // leave empty;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 justify-center bg-dark py-4 px-4">
                <Button
                    className="w-full sm:w-auto"
                    variant="incognito"
                    onClick={() => setShowWinModal(true)}
                >
                    Demo: New Win
                </Button>

                <Button
                    className=" w-full sm:w-auto"
                    variant="incognito"
                    onClick={() => setLevelUp(2)}
                >
                    Demo: Level Up!
                </Button>
            </div>
            {/* Level Up Modal */}
            {levelUp && lvl !== 'false' ? (
                <ModalLevelUp playerLevel={levelUp} setLevelUp={setLevelUp} />
            ) : null}

            {/* // Win Modal */}
            {showWinModal && win !== 'false' ? (
                <>
                    <WinModal
                        page={'leaderboard'}
                        activeModalStats={activeModalStats}
                        setShowWinModal={setShowWinModal}
                        playerStats={playerStats}
                        refreshStats={refreshStats}
                        display={'demo'}
                        hideShareWithFamily={true}
                        hideDelete={true}
                    />
                </>
            ) : null}
        </>
    );
}