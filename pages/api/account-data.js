import {
    subscription_table,
    product_table,
    minifyRecords
} from '@/utils/airtable';
import { supabase } from '@/utils/supabase-client';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { createClient } from '@supabase/supabase-js';

import { Client } from '@notionhq/client';

export default async function handler(req, res) {
    try {
        // Identify the caller from a verified credential. This route returns
        // purchase history and reads Notion credentials, so the account it acts
        // on must never come from the request body.
        //
        // Prefer the bearer token over the cookie. The client calls this from a
        // useEffect keyed on `user`, and auth-helpers publishes `user` from
        // localStorage *before* it finishes syncing the session to a cookie --
        // so on a full page load the cookie is reliably absent at that instant
        // and cookie-only auth 401s. The token is signed and verified below, so
        // trusting it is not the same as trusting req.body.
        const bearer = (req.headers.authorization || '').replace(/^Bearer /i, '');

        let user = null;
        let token = null;

        if (bearer) {
            const { data, error } = await supabaseAdmin.auth.api.getUser(bearer);
            if (!error && data) {
                user = data;
                token = bearer;
            }
        }

        if (!user) {
            const viaCookie = await supabase.auth.api.getUserByCookie(req);
            user = viaCookie.user;
            token = viaCookie.token;
        }

        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Per-request client carrying the caller's token, so the credential read
        // below runs as that signed-in user. Deliberately not
        // `supabase.auth.setAuth()` on the shared client -- that one is
        // module-level, and mutating it lets one request's token bleed into a
        // concurrent request's query.
        const supabaseForUser = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        supabaseForUser.auth.setAuth(token);

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

        const { data } = await supabaseForUser
            .from('user_private')
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