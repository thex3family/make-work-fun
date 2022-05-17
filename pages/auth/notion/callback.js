import LoadingDots from '@/components/ui/LoadingDots';
import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';

export default function notionCallback({ response, user }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (response.access_token) {
            console.log(response);
            updateDatabase()
        } else {
            setLoading(false);
        }
    }, [response])

    async function updateDatabase() {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    notion_auth_key: response.access_token,
                    notion_user_id: response.owner.user.id,
                    notion_user_name: response.owner.user.name,
                    notion_user_email: response.owner.user.person.email,
                 })
                .eq('id', user.id);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            updateNotionCredentials();
        }
    }

    // update integration generated credentials
    
    async function updateNotionCredentials() {
        try {
            const { data, error } = await supabase
                .from('notion_credentials')
                .update({
                    api_secret_key: response.access_token,
                    error: null,
                    err_execution_id: null
                })
                .eq('player', user.id)
                .eq('integration', true);

            if (error) {
                throw error;
            }
        } catch (error) {
            // alert(error.message);
        } finally {
            updateNotionCredentials();
            setLoading(false)
        }
    }

    if (!loading) {
        return (
            <>
                <section className="justify-center align-center flex h-screen">
                    <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
                        <div className="pb-10">
                            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                                Connect With Notion
                            </h1>
                            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto mt-4">
                                {response.error ? <><span className='text-red-600 font-semibold bg-red-200 rounded px-2 py-0.5 w-auto'>Error <i className='fas fa-times align-middle' /></span> <p className='mt-2 text-accents-4'>Message: {response.error}</p><p className='mt-4'>Please try to connect again. If you experience this error repeatedly, please <a className="launch_intercom cursor-pointer font-semibold text-emerald-500">contact us.</a></p></> :
                                    <><span className='text-emerald-600 font-semibold bg-emerald-200 rounded px-2 py-0.5 w-auto'>Connected <i className='fas fa-check align-middle' /></span> <p className='mt-2 text-accents-4'>Workspace: {response.workspace_name}</p><p className='mt-4'>To set up your databases, go back to the account page.</p></>}
                            </p>
                        </div>
                        <div className="text-center mx-auto">
                            <a href="/account?tab=connect&via=notion">
                                <Button className="w-auto mx-auto mt-3"
                                    variant="prominent"
                                >
                                    {response.error ? 'Try Again' : 'Continue'}
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </>
        );
    }


    return (
        <section className="justify-center h-screen flex">
            <LoadingDots />
        </section>
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
                redirect_uri: `${process.env.NEXT_PUBLIC_HOST_URL}/auth/notion/callback`
            }),
        });

        const response = await res.json();

        return { props: { response, user } };

    } catch (error) {
        console.log(error.message)
    }
}
