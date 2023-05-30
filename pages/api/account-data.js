import {
    subscription_table,
    product_table,
    minifyRecords
} from '@/utils/airtable';
import { supabase } from '@/utils/supabase-client';

import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    try {
        const { user } = req.body;

        // Check for purchases from airtable

        const purchaseRecord = await product_table
            .select({
                filterByFormula: `{customer_email} = '${user.email}'`,
                view: 'App - One-Off Purchases',
                sort: [{ field: 'value', direction: 'desc' }]
            })
            .firstPage();

        const subscriptionRecord = await subscription_table
            .select({
                filterByFormula: `{customer_email} = '${user.email}'`,
                view: 'App - Active Subscriptions',
                sort: [{ field: 'value', direction: 'desc' }]
            })
            .firstPage();

        const inactiveSubscriptionRecord = await subscription_table
            .select({
                filterByFormula: `{customer_email} = '${user.email}'`,
                view: 'App - Inactive Subscriptions',
                sort: [{ field: 'value', direction: 'desc' }]
            })
            .firstPage();

        const { data } = await supabase
            .from('users')
            .select('notion_auth_key')
            .eq('id', user.id)
            .single();

        let notion_databases = null;

        if (data) {
            const notion_auth_key = data.notion_auth_key
            try {
                const notion = new Client({ auth: notion_auth_key });

                if (notion) {
                    const databases = await notion.search({
                        filter: {
                            value: 'database',
                            property: 'object',
                        }
                    });

                    notion_databases = databases.results;
                }

            } catch {
            }
        }

        res.status(200).json({
            initialPurchaseRecord: minifyRecords(purchaseRecord),
            subscriptionPurchaseRecord: minifyRecords(subscriptionRecord),
            inactiveSubscriptionRecord: minifyRecords(inactiveSubscriptionRecord),
            user,
            notion_databases
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}