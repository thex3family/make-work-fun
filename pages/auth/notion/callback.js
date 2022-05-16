import LoadingDots from '@/components/ui/LoadingDots';
import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';

export default function notionCallback({ response, user }) {

    useEffect(() => {
        if (response.access_token) {
            updateDatabase()
        }
    }, [response])

    async function updateDatabase() {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ notion_auth_key: response.access_token })
                .eq('id', user.id);
            
            if (error) {
                throw error;
            }
        } catch (error) {
            alert(error.message);
        } finally {
            updateNotionCredentials();
        }
    }

    async function updateNotionCredentials() {
        try {
            const { data, error } = await supabase
                .from('notion_credentials')
                .update({ api_secret_key: response.access_token })
                .eq('player', user.id)
                .eq('integration', true);
            
            if (error) {
                throw error;
            }
        } catch (error) {
            alert(error.message);
        } finally {
            updateNotionCredentials();
        }
    }

    return (
        <>
            <section className="justify-center align-center flex h-screen">
                <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
                    <div className="pb-10">
                        <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                            Connect With Notion
                        </h1>
                        <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto mt-4">
                            {response.error ? <><span className='text-red-600 font-semibold bg-red-200 rounded px-2 py-0.5 w-auto'>Error <i className='fas fa-times align-middle' /></span> <p className='mt-2 text-accents-4'>Message: {response.error}</p><p className='mt-4'>Close this window and try again. If you experience this error repeatedly, please <a className="launch_intercom cursor-pointer font-semibold text-emerald-500">contact us.</a></p></> :
                                <><span className='text-emerald-600 font-semibold bg-emerald-200 rounded px-2 py-0.5 w-auto'>Connected <i className='fas fa-check align-middle' /></span> <p className='mt-2 text-accents-4'>Workspace: {response.workspace_name}</p><p className='mt-4'>Close this window to continue.</p></>}
                        </p>
                    </div>
                    <div className="text-center mx-auto">

                    </div>
                </div>
            </section>
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        const code = context.query.code
        const { user } = await supabase.auth.api.getUserByCookie(context.req);


        // Send credentials to Notion API to get the access code
        const res = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'post',
            headers: new Headers({
                'Authorization': 'Basic ' + Buffer.from(process.env.NOTION_CLIENT_ID + ":" + process.env.NOTION_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
                grant_type: `authorization_code`,
                code: code,
                redirect_uri: `https://makework.fun/auth/notion/callback`
            }),
        });

        const response = await res.json();

        return { props: { response, user } };

    } catch (error) {
        console.log(error.message)
    }
}
