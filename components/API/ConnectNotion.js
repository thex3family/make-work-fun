import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/utils/supabase-client';
import LoadingDots from '../ui/LoadingDots';
import { Popover, Switch } from '@mantine/core';

export default function ConnectNotion({
  credentials,
  getNotionCredentials,
  setShowSaveModal,
  userProfile
}) {
  const [secretKey, setSecretKey] = useState(null);
  const [databaseID, setDatabaseID] = useState(null);
  const [collaborator, setCollaborator] = useState(null);
  const [finalCollaboratorID, setFinalCollaboratorID] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showCollaborator, setShowCollaborator] = useState(false);
  const [APIMessage, setAPIMessage] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const [databaseMessage, setDatabaseMessage] = useState(null);
  const [userMessage, setUserMessage] = useState(null);
  const [nickname, setNickname] = useState(null);


  const [customCollaborator, setCustomCollaborator] = useState(true);

  const [deleteOption, setDeleteOption] = useState(false);
  const [editState, setEditState] = useState(true);

  const notionOAuthURL = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=434a27ea-a826-4129-88ea-af114203938c&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_HOST_URL)}%2Fauth%2Fnotion%2Fcallback&response_type=code`;


  var api = /^(?:secret|ntn)_\w{43}$/;
  var id = /^\(?([0-9a-zA-Z]{8})\)?[-. ]([0-9a-zA-Z]{4})[-. ]([0-9a-zA-Z]{4})[-. ]([0-9a-zA-Z]{4})[-. ]([0-9a-zA-Z]{12})$/;
  var notionLink = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;

  useEffect(() => {
    setNickname(credentials.nickname);
    setSecretKey(credentials.api_secret_key);
    setDatabaseID(credentials.database_id);
    if (credentials.collaborator) setCollaborator(credentials.collaborator);
    if (credentials.collaborator) setShowCollaborator(true);
    if (credentials.collaborator === userProfile?.notion_user_id) setCustomCollaborator(false);
    setSaving(false);
    setDeleteOption(false);
  }, [credentials, userProfile]);

  // if the secretkey changes, validate
  useEffect(() => {
    if (credentials.error) {
      setConnectError(true)
    };
  }, [credentials.error]);

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
  }, [collaborator, customCollaborator, showCollaborator]);

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
      // alert(error.message);
      console.log(error.message);
    } finally {
      getNotionCredentials();
      // setDeleteOption(false);
      // setSaving(false);
    }
  }

  // validate secret key

  function validateSecretKey() {
    if (secretKey) {
      if (secretKey.match(api)) {
        setAPIMessage(null);
      } else {
        setAPIMessage(
          'Secret should start with ntn_ and be 50 characters in length.'
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
    if (showCollaborator) {
      if (collaborator && customCollaborator) {
        if (collaborator.match(id)) {
          setUserMessage(null);
          setFinalCollaboratorID(collaborator);
        } else {
          setUserMessage(
            'Please enter a valid user ID. Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
          );
        }
      } else {
        setUserMessage(null);
      }
      if (!collaborator && customCollaborator) {
        setFinalCollaboratorID(null);
      }
      if (userProfile?.notion_user_id && !customCollaborator) {
        setFinalCollaboratorID(userProfile.notion_user_id);
      }
    }
    if (!showCollaborator) {
      setFinalCollaboratorID(null);
    }
  }

  async function saveCredential(
    row_id,
    api_secret_key,
    database_id,
    collaborator_id,
    showCollaborator
  ) {
    setSaving(true);
    setCollaborator(collaborator_id);
    if (!collaborator_id) {
      setShowCollaborator(false);
    }
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
          collaborator: collaborator_id,
          modified_at: new Date(),
          error: null,
          err_execution_id: null
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
      // alert(error.message);
      console.log(error.message);
    } finally {
      getNotionCredentials();
      setShowSaveModal(true);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      saveCredential(credentials.id, secretKey, databaseID, finalCollaboratorID, showCollaborator)
    }}>
      <div className="mb-4 mt-4 border border-gray-600 px-4 rounded">
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
        {connectError ? (
          <div className="flex flex-col space-y-4">
            <div className="mt-4 text-error border border-error p-3">
              <b>We've detected an error with your credentials. Test your connection to see how to fix.</b>
            </div>
          </div>
        ) : null}

        {credentials.integration ?
          <>
            <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
              <p className="font-semibold w-full sm:w-auto">Database Name</p>
            </div>
            <Input
              className="text-xl mb-2 font-semibold rounded"
              type="varchar"
              placeholder="Success Plan"
              value={nickname || ''}
              onChange={setNickname}
              disabled={saving}
            />
            <div className="mt-2 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
              <p className="font-semibold w-full sm:w-auto">Database ID</p>
            </div>
            <a href={`https://notion.so/` + databaseID?.replaceAll('-', '')} target="_blank"><p
              className="text-xl font-semibold rounded"
            >{databaseID}<i className='ml-2 fas fa-external-link-alt' /></p></a></>
          : null
        }
        {!credentials.integration ?
          <><div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
            <p className="font-semibold w-full sm:w-auto">Database Name</p>
          </div>
            <Input
              className="text-xl mb-2 font-semibold rounded"
              type="varchar"
              placeholder="Success Plan"
              value={nickname || ''}
              onChange={setNickname}
              disabled={saving}
            />
            <div className="mt-2 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
              <p className="font-semibold w-full sm:w-auto">Database ID</p>
              <a
                className="text-right font-semibold text-emerald-500 hideLinkBorder"
                href="https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/how-do-i-manually-connect-my-notion-databases-to-the-make-work-fun-app/qs4LtpXeUXgEnEQ88kJuDi#step-4-get-your-database-id?utm_source=makeworkfun"
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
              disabled={saving}
            />
            <div className="mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap">
              <p className="font-semibold w-full sm:w-auto">Notion API Secret</p>
              <a
                className="text-right font-semibold text-emerald-500 hideLinkBorder"
                href="https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/how-do-i-manually-connect-my-notion-databases-to-the-make-work-fun-app/qs4LtpXeUXgEnEQ88kJuDi#step-2-get-your-notion-api-secret?utm_source=makeworkfun"
                target="_blank"
              >
                Where do I find this?
              </a>
            </div>
            <Input
              className="text-xl mb-2 font-semibold rounded"
              type="varchar"
              placeholder="secret_•••"
              maxlength="50"
              value={secretKey || ''}
              onChange={setSecretKey}
              disabled={saving}
            />

          </>
          : null}


        <Switch
          checked={!showCollaborator} onChange={(event) => !saving ? setShowCollaborator(!event.currentTarget.checked) : null}
          label="This is a private database"
          color="teal"
          classNames={{
            size: 'xl',
            root: 'mt-5',
            input: 'bg-gray-600',
            label: 'text-white font-semibold text-lg',
          }}
        />
        {/* <div className="flex items-center my-6">
          <div
            className="border-t border-yellow-500 flex-grow mr-3"
            aria-hidden="true"
          ></div>
          <button
            type="button"
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
        </div> */}

        <div className={`${showCollaborator ? 'block' : 'hidden'}`}>
          <div className="mt-4 mb-2">
            <p className="w-full sm:w-auto">
              If you have multiple users sharing this database in Notion, you can specify which wins to sync to your Make Work Fun account by specifying your Notion User ID below. <a
                className="text-right font-semibold text-emerald-500 hideLinkBorder"
                href="https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/what-if-my-database-is-currently-being-shared-with-multiple-people/dkZxaJLKU5JtKfuGkPvWwY?utm_source=makeworkfun"
                target="_blank"
              >
                Learn more.
              </a>
            </p>
          </div>
          <p className="font-semibold">
            ⚠️ If you do not have a collaborators property in your database this feature will not work.
          </p>
          <div className='mt-3 flex flex-row justify-between mb-2 flex-wrap sm:flex-nowrap gap-4'>

            {
              userProfile?.notion_user_name && userProfile?.notion_user_email && userProfile?.notion_user_id ?
                <div className={`p-4 border-2  rounded w-full cursor-pointer bg-opacity-20 border-opacity-80 ${customCollaborator ? 'bg-gray-500 border-gray-500' : 'bg-emerald-500 border-emerald-500'}`}
                  onClick={() => !saving ? setCustomCollaborator(false) : null}>
                  <div className="mb-2 flex justify-between flex-wrap gap-1.5">
                    <span className="font-semibold w-full sm:w-auto mr-1">Connected Notion Account </span>{customCollaborator ? null : <span className='text-xs font-semibold py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200'>Selected</span>}
                  </div>
                  <p
                    className="text-lg font-semibold rounded"
                  >{userProfile?.notion_user_name} ({userProfile?.notion_user_email})
                    <p className='text-sm'>{userProfile?.notion_user_id}</p>
                  </p>
                </div>
                : <div className={`p-4 border-2  rounded w-full bg-opacity-20 border-opacity-80 bg-gray-500 border-gray-500`}
                >
                  <div className="mb-2 flex justify-between flex-wrap gap-1.5">
                    <span className="font-semibold w-full sm:w-auto mr-1">Notion Not Connected </span>{customCollaborator ? null : <span className='text-xs font-semibold py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200'>Selected</span>}
                  </div>
                  <div>
                    <a href={notionOAuthURL}><Button type="button" variant="prominent">Connect With Notion
                    </Button></a>
                  </div>
                </div>
            }

            <div className={`p-4 border-2  rounded w-full cursor-pointer bg-opacity-20 border-opacity-80 ${!customCollaborator ? 'bg-gray-500 border-gray-500' : 'bg-emerald-500 border-emerald-500'}`}
              onClick={() => !saving ? setCustomCollaborator(true) : null}>
              <div className="mb-3 flex justify-between flex-wrap gap-1.5">
                <span className="font-semibold w-full sm:w-auto">Custom Notion User ID </span>{!customCollaborator ? null : <span className='text-xs font-semibold py-1 px-2 uppercase rounded text-emerald-600 bg-emerald-200'>Selected</span>}
              </div>
              <Input
                className="text-xl font-semibold rounded"
                type="varchar"
                placeholder="••••••••-••••-••••-••••-••••••••••••••••"
                value={collaborator || ''}
                onChange={setCollaborator}
                disabled={saving}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center sm:justify-between flex-wrap-reverse gap-3 flex-row my-4 items-center">
          <Popover
            classNames={{
              popover: 'bg-dark',
              arrow: 'bg-dark',
            }}
            opened={deleteOption}
            onClose={() => setDeleteOption(false)}
            target={
              <button
                type="button"
                onClick={() => setDeleteOption(!deleteOption)}
                className="text-red-500 font-semibold"
                disabled={saving}
              >
                {saving ? <LoadingDots /> : 'Remove'}
              </button>}
            width={260}
            position="bottom"
            withArrow
          >
            <div className=''>
              <p className='font-semibold mb-4'>The app will stop syncing wins with {nickname ? nickname : 'this database'}.</p>
              <div className='flex justify-between text-lg'>
                <button
                  type="button"
                  onClick={() => removeCredentials(credentials.id)}
                  className="text-red-600 font-semibold bg-red-200 px-6 rounded"
                  disabled={saving}
                >
                  {saving ? <LoadingDots /> : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOption(false)}
                  className="text-gray-600 font-semibold bg-gray-200 px-6 rounded"
                >
                  {saving ? <LoadingDots /> : 'No'}
                </button>
              </div>
            </div>
          </Popover>
          {/* {deleteOption ? <>
            <span className='text-white font-semibold ease-linear transition-all duration-150'>
              Are You Sure?{' '}
              <button
                type="button"
                onClick={() => removeCredentials(credentials.id)}
                className="text-red-500 mr-1 font-semibold"
                disabled={saving}
              >
                {saving ? <LoadingDots /> : 'Yes'}
              </button>
              /
              <button
                type="button"
                onClick={() => setDeleteOption(false)}
                className="text-red-500 ml-1 font-semibold"
              >
                {saving ? <LoadingDots /> : 'No'}
              </button>
            </span>
          </> :
            <button
              type="button"
              onClick={() => setDeleteOption(true)}
              className="text-red-500 font-semibold"
              disabled={saving}
            >
              {saving ? <LoadingDots /> : 'Remove'}
            </button>} */}
          <Button
            className="w-full sm:w-auto"
            variant="incognito"
            type="submit"
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
    </form>
  );
}
