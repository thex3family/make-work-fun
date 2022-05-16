import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '../ui/LoadingDots';
import { userContent } from '@/utils/useUser';

export default function NewNotionDatabases({
  database,
  getNotionCredentials,
  setShowSaveModal
}) {

  const { user, userProfile } = userContent();
  console.log(database)

  const [saving, setSaving] = useState(false);
  async function createCredential() {
    setSaving(true);
    try {
      console.log(user)

      const { data, error } = await supabase
        .from('notion_credentials')
        .insert([{
          nickname: database.title[0].plain_text,
          api_secret_key: userProfile.notion_auth_key,
          database_id: database.id,
          player: userProfile.id,
          integration: true,
        }])

      // set the test pair

      const { data2, error2 } = await supabase
      .from('notion_credentials_validation')
      .upsert({ player: userProfile.id, test_pair: data[0].id })
      .eq('player', userProfile.id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      getNotionCredentials();
      setShowSaveModal(true);
      setSaving(false);
    }
  }

  return (
    <div className='flex justify-between'>
      <a href={database.url} target="_blank">
        <p className='font-semibold text-md'>{database.title[0].plain_text} <i className='ml-1 fas fa-external-link-alt' /></p>
        <p>{database.id}</p>
      </a>
      <Button
        className="w-full sm:w-auto"
        variant="prominent"
        type="submit"
        disabled={
          saving
        }
        onClick={() => createCredential()}
      >
        {saving ? <LoadingDots /> : 'Connect'}
      </Button></div>
  );
}
