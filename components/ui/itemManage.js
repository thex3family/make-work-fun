import { useEffect, useState } from 'react';
import { fetchActiveTimer } from '../Fetch/fetchMaster';
import { supabase } from '@/utils/supabase-client';
import ItemBanner from './ItemBanner';

export default function ItemManage({ player, setOverrideMetaTitle }) {

    const [activeTimer, setActiveTimer] = useState(null);


    useEffect(() => {
        fetchActiveTimer(player.id, setActiveTimer);

        console.log('Checking for item purchases')
        const itemSubscription = supabase
            .from(`item_purchases:player=eq.${player.id}`)
            .on('INSERT', async payload => {
                console.log('Item Purchased!', payload)
                fetchActiveTimer(player.id, setActiveTimer);
            })
            .subscribe()

        async function removeSubscription() {
            await supabase.removeSubscription(itemSubscription);
        }

        console.log('itemSubscription', itemSubscription);

        return () => {
            console.log('Removing itemSubscription');
            removeSubscription();
        }
    }, []);

return (
    activeTimer ?
        activeTimer?.map((activeTimeItem, i) => (
            <ItemBanner
                index={i} activeTimeItem={activeTimeItem} setOverrideMetaTitle={setOverrideMetaTitle} />
        ))
        : null
);
}