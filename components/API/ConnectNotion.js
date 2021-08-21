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
  const [collaborator, setCollaborator] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCollaborator, setShowCollaborator] = useState(false);
  const [APIMessage, setAPIMessage] = useState(null);
  const [databaseMessage, setDatabaseMessage] = useState(null);
  const [userMessage, setUserMessage] = useState(null);
  const [nickname, setNickname] = useState(null);

  var api = /^secret_\w{43}$/;
  var id = /^\(?([0-9a-zA-Z]{8})\)?[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{4})[-. ]?([0-9a-zA-Z]{12})$/;
  var notionLink = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;

  useEffect(() => {
    setNickname(credentials.nickname);
    setSecretKey(credentials.api_secret_key);
    setDatabaseID(credentials.database_id);
    if (credentials.collaborator) setCollaborator(credentials.collaborator);
    if (credentials.collaborator) setShowCollaborator(true);
  }, []);

  // if the secretkey changes, validate
  useEffect(() => {
    validateSecretKey();
  }, [secretKey]);

  // if the databaseID changes, validate
  useEffect(() => {
    validateDatabaseID();
  }, [databaseID]);

  // if the userID changes, validate
  useEffect(() => {
    validateCollaborator();
  }, [collaborator]);

  async function removeCredentials(row_id) {
    setSaving(true);
    try {
      const user = supabase.auth.user();

      await supabase
        .from('notion_credentials_validation')
        .delete()
        .eq('player', user.id);

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

  // validate secret key

  function validateSecretKey() {
    if (secretKey) {
      if (secretKey.match(api)) {
        setAPIMessage(null);
      } else {
        setAPIMessage(
          'Secret should start with secret_ and be 50 characters in length.'
        );
      }
    }
  }

  // validate database ID

  function validateDatabaseID() {
    if (databaseID) {
      // if matches ID structure

      if (databaseID.match(id)) {
        setDatabaseMessage(null);

        // if matches a LINK
      } else if (databaseID.match(notionLink)) {
        setDatabaseMessage(null);
      } else {
        setDatabaseMessage('Please enter a valid database URL.');
      }
    }
  }

  // validate collaborator user ID

  function validateCollaborator() {
    if (collaborator) {
      if (collaborator.match(id)) {
        setUserMessage(null);
      } else {
        setUserMessage(
          'Please enter a valid user ID. Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
        );
      }
    } else {
      setUserMessage(null);
    }
  }

  async function saveCredential(
    row_id,
    api_secret_key,
    database_id,
    collaborator_id
  ) {
    setSaving(true);
    try {
      const user = supabase.auth.user();

      // if matches a url, then change the format

      if (database_id.match(notionLink)) {
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
        .update({
          nickname: nickname,
          api_secret_key: api_secret_key,
          database_id: database_id,
          collaborator: collaborator_id
        })
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
      {APIMessage || databaseMessage || userMessage ? (
        <div className="flex flex-col space-y-4">
          <div className="mt-4 text-error border border-error p-3">
            <b>Please fix the following problems before saving:</b>
            {APIMessage ? <div>- {APIMessage}</div> : null}
            {databaseMessage ? <div>- {databaseMessage}</div> : null}
            {userMessage ? <div>- {userMessage}</div> : null}
          </div>
        </div>
      ) : null}
      <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
        <p className="font-semibold w-full sm:w-auto">Database Name (Optional)</p>
      </div>
      <Input
        className="text-xl mb-2 font-semibold rounded"
        type="varchar"
        placeholder="Success Plan"
        value={nickname || ''}
        onChange={setNickname}
      />
      <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
        <p className="font-semibold w-full sm:w-auto">Notion API Secret</p>
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
      <div className="mt-2 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
        <p className="font-semibold w-full sm:w-auto">Database ID</p>
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
      <div className="flex items-center my-6">
        <div
          className="border-t border-yellow-500 flex-grow mr-3"
          aria-hidden="true"
        ></div>
        <button
          onClick={() => setShowCollaborator(!showCollaborator)}
          className="text-yellow-500 font-semibold truncate"
          disabled={saving}
        >
          I'm sharing this database with other users!
        </button>
        <div
          className="border-t border-yellow-500 flex-grow ml-3"
          aria-hidden="true"
        ></div>
      </div>

      <div className={`${showCollaborator ? 'block' : 'hidden'}`}>
        <div className="mt-2 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
          <p className="font-semibold w-full sm:w-auto">
            Count the win ONLY if Collaborator includes the user ID...
          </p>
          <a
            className="text-right font-semibold text-yellow-500"
            href="https://academy.co-x3.com/en/articles/5486715-what-if-my-database-is-currently-being-shared-with-multiple-people"
            target="_blank"
          >
            Where do I find this?
          </a>
        </div>
        <Input
          className="text-xl font-semibold rounded"
          type="varchar"
          placeholder="Leave blank to attribute all wins to yourself!"
          value={collaborator || ''}
          onChange={setCollaborator}
        />
      </div>
      <div className="flex justify-between my-4">
        <button
          onClick={() => removeCredentials(credentials.id)}
          className="text-red-500 mr-5 font-semibold"
          disabled={saving}
        >
          {saving ? <LoadingDots /> : 'Remove'}
        </button>
        <Button
          className="w-full sm:w-auto"
          variant="incognito"
          onClick={() =>
            saveCredential(credentials.id, secretKey, databaseID, collaborator)
          }
          disabled={
            saving ||
            APIMessage != null ||
            databaseMessage != null ||
            userMessage != null || databaseID == null || secretKey == null
          }
        >
          {saving ? <LoadingDots /> : 'Save And Test'}
        </Button>
      </div>
    </div>
  );
}
