import { Client } from '@notionhq/client';
import React from 'react';
import { supabase } from '../utils/supabase-client';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotionPageWizard({ response, notion_page_name, slug }) {
  const notion_page_id = response.id;

  return (
    <>
      <section className="animate-fade-in-up">
        <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col h-auto justify-center">
          <div className="pb-10">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              We've Found Your Dragon!
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
              We'll now be looking for quests with the upstream project:
              <div className="text-emerald-500 font-semibold mt-3">
                {notion_page_name}
              </div>
              <div className="text-sm text-accents-5">ID: {notion_page_id}</div>
              <img className="w-full mt-8 mb-5 mx-auto" src="/og.png" />
              <Link href={`/parties/details?id=${slug}`}>
                <Button className="text-base mt-5" variant="prominent">
                  Back To Party
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get credentials from Supabase
    const { user } = await supabase.auth.api.getUserByCookie(req);

    const key = await supabase
      .from('notion_credentials_validation')
      .select('test_pair, test_member')
      .eq('player', user.id)
      .limit(1)
      .single();

    const data = await supabase
      .from('notion_credentials')
      .select('nickname, api_secret_key, database_id')
      .eq('id', key.data.test_pair)
      .limit(1)
      .single();

    const dragon = await supabase
      .from('party_member_details')
      .select('notion_page_id, party_slug')
      .eq('party_member_id', key.data.test_member)
      .limit(1)
      .single();

    const credentials = data.body;
    const slug = dragon.data.party_slug;

    // Send credentials to Notion API
    const notion = new Client({ auth: credentials.api_secret_key });
    const response = await notion.pages.retrieve({
      page_id: dragon.data.notion_page_id
    });

    const notion_page_name = response.properties.Name.title[0].plain_text;

    await supabase
      .from('party_members')
      .update({
        notion_page_name: notion_page_name
      })
      .eq('id', key.data.test_member);

    return { props: { response, notion_page_name, slug } };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: '/credentials-invalid',
        permanent: false
      }
    };
  }
}
