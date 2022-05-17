import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '../ui/LoadingDots';
import { a11yDark, CopyBlock, dracula } from "react-code-blocks";

export default function ConnectPOST({ APIKeys, getAPIKeys
}) {

    const [deleteOption, setDeleteOption] = useState(null);
    const [generating, setGenerating] = useState(null);
    const [copyText1, setCopyText1] = useState('Copy');
    const [copyText2, setCopyText2] = useState('Copy');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setGenerating(false);
    }, [APIKeys]);

    // generate secret link

    async function generateAPIKey() {
        setGenerating(true);
        try {
            const user = supabase.auth.user();
            const { data, error } = await supabase.from('api_keys').insert([
                {
                    player: user.id,
                }
            ]);
            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            // alert(error.message);
      console.log(error.message);
        } finally {
            getAPIKeys();
        }
    }


    async function deleteAPIKey(id) {
        setGenerating(true);
        try {
            const user = supabase.auth.user();
            const { data, error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', id)
                .eq('player', user.id);
            if (error && status !== 406) {
                throw error;
            }
        } catch (error) {
            // alert(error.message);
      console.log(error.message);
        } finally {
            getAPIKeys();
        }
    }


    async function copyLink(component, text) {
        navigator.clipboard.writeText(text);
        if (component == 1) {
            setCopyText1('Copied!');
        }
        if (component == 2) {
            setCopyText2('Copied!');
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 sec

        if (component == 1) {
            setCopyText1('Copy');
        }
        if (component == 2) {
            setCopyText2('Copy');
        }
    }

    return (
        <div className="mb-4 mt-4 border border-gray-600 px-4 rounded">
            {APIKeys?.length == 0 ?
                <div className="my-3 items-center w-full">
                    <Button
                        className="w-full"
                        variant="slim"
                        onClick={() => generateAPIKey()}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Generate Secret API Key'}
                    </Button>
                </div> :
                APIKeys.map((key) => (
                    <div className="my-3 mb-6">
                        <p className="font-semibold w-full sm:w-auto mb-2">Your Secret API Key</p>
                        <div className="grid grid-cols-8 items-center gap-3">
                            <div className="col-span-4">
                                <Input
                                    className="text-xl font-semibold rounded"
                                    value={key.id}
                                />
                            </div>
                            <Button
                                className="col-span-3"
                                variant="slim"
                                onClick={() => copyLink(1, key.id)}
                                disabled={generating}
                            >
                                {copyText1}
                            </Button>
                            <Button
                                className="col-span-1"
                                variant="delete"
                                onClick={() => deleteAPIKey(key.id)}
                                disabled={generating}
                            >
                                <i className='fas fa-trash-alt text-white' />
                            </Button>
                        </div>

                        {/* <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
                            <p className="font-semibold w-full sm:w-auto">Webhook URL (POST)</p>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <Input
                                className="text-xl mb-2 font-semibold rounded"
                                type="varchar"
                                placeholder="Success Plan"
                                value={'https://n8n.x3.family/webhook/new-win'}
                            /> <Button
                                className="col-span-1"
                                variant="slim"
                                onClick={() => copyLink(2, 'https://n8n.x3.family/webhook/new-win')}
                                disabled={generating}
                            >
                                {copyText2}
                            </Button>
                        </div> */}

                        <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
                            <p className="font-semibold w-full sm:w-auto">Webhook Sample (cURL)</p>
                            <a
                                className="text-right font-semibold text-emerald-500"
                                href="https://academy.co-x3.com/en/articles/5851787-send-wins-via-api-to-the-app"
                                target="_blank"
                            >
                                View Documentation
                            </a>
                        </div>
                        <CopyBlock
      text={
`curl --location --request POST 
'https://n8n.x3.family/webhook/new-win'\
 
--header 'Content-Type: application/json' \
 
--data-raw '{
    "api_key": "${key.id}"
    "name": "Test"
}'`}
      language='c'
      showLineNumbers='true'
      wrapLines
      theme={a11yDark}
    />

                    </div>

                ))
            }



        </div>
    );
}
