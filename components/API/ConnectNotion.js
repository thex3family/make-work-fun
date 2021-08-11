import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '../ui/LoadingDots';

export default function ConnectNotion({
  credentials,
  getNotionCredentials,
  setShowSaveModal
}) {
  const [secretKey, setSecretKey] = useState(null);
  const [databaseID, setDatabaseID] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSecretKey(credentials.api_secret_key);
    setDatabaseID(credentials.database_id);
  }, []);

  async function removeCredentials(row_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('notion_credentials')
        .delete()
        .eq('id', row_id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      getNotionCredentials();
      setSaving(false);
    }
  }

  async function saveCredential(row_id, api_secret_key, database_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();

      if (!database_id.includes('-')) {
        const url = database_id;
        const url2 = url.split('?')[0];
        const url3 = url2.substring(url.lastIndexOf('/') + 1);
        database_id =
          url3.substr(0, 8) +
          '-' +
          url3.substr(8, 4) +
          '-' +
          url3.substr(12, 4) +
          '-' +
          url3.substr(16, 4) +
          '-' +
          url3.substr(20);
        setDatabaseID(database_id);
      }

      const { data, error } = await supabase
        .from('notion_credentials')
        .update({ api_secret_key: api_secret_key, database_id: database_id })
        .eq('id', row_id);


      // set the test pair

      const { data2, error2 } = await supabase
        .from('notion_credentials_validation')
        .upsert({ player: user.id, test_pair: row_id })
        .eq('player', user.id);

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
    <div className="mb-4 mt-4 border-dotted border border-gray-200 px-4 rounded">
      <div className="mt-3 flex flex-row justify-between">
        <p className="font-semibold">Notion API Secret</p>
        <a
          className="text-right font-semibold text-emerald-500"
          href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection#h_a887bad862"
          target="_blank"
        >
          Where do I find this?
        </a>
      </div>
      <Input
        className="text-xl mb-2 font-semibold rounded"
        type="varchar"
        placeholder="secret_•••"
        value={secretKey || ''}
        onChange={setSecretKey}
      />
      <div className="mt-2 flex flex-row justify-between">
        <p className="font-semibold">Database ID</p>
        <a
          className="text-right font-semibold text-emerald-500"
          href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection#h_b577a8d246"
          target="_blank"
        >
          Where do I find this?
        </a>
      </div>
      <Input
        className="text-xl font-semibold rounded"
        type="varchar"
        placeholder="https://www.notion.so/•••"
        value={databaseID || ''}
        onChange={setDatabaseID}
      />
      <div className="flex justify-between my-4">
        <button
          onClick={() => removeCredentials(credentials.id)}
          className="text-red-500 mr-5 font-semibold"
          disabled={saving}
        >
          {saving ? <LoadingDots /> : 'Remove Credentials'}
        </button>
        <Button
          className="w-full sm:w-auto"
          variant="incognito"
          onClick={() => saveCredential(credentials.id, secretKey, databaseID)}
          disabled={saving}
        >
          {saving ? <LoadingDots /> : 'Save And Test'}
        </Button>
      </div>
    </div>
  );
}
