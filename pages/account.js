import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';
import Input from '@/components/ui/Input';

import { supabase } from '@/utils/supabase-client';
import { table, minifyRecords } from '@/utils/airtable';
import ConnectNotion from '@/components/API/ConnectNotion';

function Card({ title, description, footer, children }) {
  return (
    <div className="border border-accents-1	max-w-3xl w-full p rounded-md m-auto my-8">
      <div className="px-5 py-4">
        <h3 className="text-2xl mb-1 font-medium">{title}</h3>
        <p className="text-accents-5">{description}</p>
        {children}
      </div>
      <div className="border-t border-accents-1 bg-primary-2 p-4 text-accents-3 rounded-b-md">
        {footer}
      </div>
    </div>
  );
}

export default function Account({ initialPurchaseRecord }) {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const router = useRouter();
  const [full_name, setName] = useState(null);

  const [notionCredentials, setNotionCredentials] = useState(null);

  const { userLoaded, user, session, userDetails, subscription } = useUser();
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (user) getProfile();
    if (user) getNotionCredentials();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from('users')
        .select(`full_name`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.full_name);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getNotionCredentials() {
    try {
      // setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from('notion_credentials')
        .select(`*`)
        .eq('player', user.id)
        .order('id', { ascending: true });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log('notioncredentials', data);
        console.log(data.length);
        setNotionCredentials(data);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      // setLoading(false);
    }
  }

  async function updateProfile({ full_name }) {
    try {
      setSaveLoading(true);
      const user = supabase.auth.user();

      let { error } = await supabase
        .from('users')
        .update({
          full_name: full_name
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSaveLoading(false);
    }
  }

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    const { url, error } = await postData({
      url: '/api/create-portal-link',
      token: session.access_token
    });
    if (error) return alert(error.message);
    window.location.assign(url);
    setLoading(false);
  };

  const subscriptionName = subscription && subscription.prices.products.name;
  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription.prices.currency,
      minimumFractionDigits: 0
    }).format(subscription.prices.unit_amount / 100);

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  async function addCredentials() {
    const newRow = {
      player: user.id
    };

    try {
      const user = supabase.auth.user();

      const { data, error } = await supabase
        .from('notion_credentials')
        .insert(newRow);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      getNotionCredentials();
      setLoading(false);
    }
  }

  return (
    <>
      <section className="animate-fade-in-up bg-black mb-32">
        <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Welcome, Hero!
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
              Access all your goodies and set up your app here.
            </p>
          </div>
        </div>
        <div className="p-4">
          {/* <Card
          title="Your Plan"
          description={
            subscriptionName &&
            `You are currently on the ${subscriptionName} plan.`
          }
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                Manage your subscription.
              </p>
              <Button className="w-full sm:w-auto"
                variant="slim"
                loading={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                Open customer portal
              </Button>
            </div>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold">
            {!userLoaded ? (
              <div className="h-12 mb-6">
                <LoadingDots />
              </div>
            ) : subscriptionPrice ? (
              `${subscriptionPrice}/${subscription.prices.interval}`
            ) : (
              <Link href="/">
                <a className="text-emerald-500">EARLY ACCESS - Thank you for being a very important member of our family.</a>
              </Link>
            )}
          </div>
        </Card>
        
        <Card
          title="Your Email"
          >
            <p className="text-xl mt-8 mb-4 font-semibold">
              {user ? user.email : undefined}
            </p>
        </Card> */}
          <div className="form-widget">
            <Card
              title="Your Toolbox Purchases"
              description="Your one-stop dashboard to accessing all of your resources."
              footer={
                <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                  <p className="pb-4 sm:pb-0 w-full sm:w-3/4">
                    Not seeing everything? Your resources are tied to your
                    email. You are currently logged in as <b>{user.email}</b>
                  </p>
                  <a
                    href="https://toolbox.co-x3.com/?utm_source=makeworkfun"
                    target="_blank"
                  >
                    <Button
                      className="w-full sm:w-auto"
                      variant="incognito"
                      loading={loading}
                    >
                      Visit Our Toolbox
                    </Button>
                  </a>
                </div>
              }
            >
              <div className="text-xl mt-8 mb-4 font-semibold">
                {!userLoaded ? (
                  <div className="h-12 mb-6">
                    <LoadingDots />
                  </div>
                ) : initialPurchaseRecord.length != 0 ? (
                  initialPurchaseRecord.map((purchase) => (
                    <div className="pb-5 flex justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        <div className="flex flex-row items-center">
                          <div className="truncate">
                            {purchase.fields.product_name}
                          </div>
                          <span className="ml-2 text-xs font-semibold inline-block uppercase rounded text-accents-3">
                            {purchase.fields.subscription_type}
                          </span>
                        </div>

                        <p className="text-accents-5 text-sm">
                          {purchase.fields.type == 'One Off'
                            ? 'Purchased On: '
                            : 'Joined On: '}
                          <span className="text-accents-3">
                            {purchase.fields.purchase_date.split('T')[0]}
                          </span>
                        </p>
                        {purchase.fields.streak ? (
                          <p className="text-accents-5 text-sm">
                            Streak:{' '}
                            {Array.from(
                              { length: purchase.fields.streak },
                              (_, i) => (
                                <span key={i}>⭐</span>
                              )
                            )}
                          </p>
                        ) : (
                          ''
                        )}
                      </p>
                      {
                        <a href={purchase.fields.download_url} target="_blank">
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                            loading={loading}
                          >
                            Download Template
                          </Button>
                        </a>
                      }
                    </div>
                  ))
                ) : (
                  <div>
                    <a
                      href="https://toolbox.co-x3.com/?utm_source=makeworkfun"
                      target="_blank"
                      className="text-emerald-500"
                    >
                      You haven't unlocked any resources yet. Let's change that.
                    </a>
                    <div
                      className="border-t border-accents-2 my-5 flex-grow mr-3"
                      aria-hidden="true"
                    ></div>
                    <p className="mb-3">Start with...</p>
                    <div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        Gamify Your Life (FREE Notion Template)
                        <p className="text-accents-5 text-sm">
                          Task management, habit tracking, and more.
                        </p>
                      </p>
                      {
                        <a
                          href="http://makeworkfun.club/personal/?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                            loading={loading}
                          >
                            Get Template
                          </Button>
                        </a>
                      }
                    </div>
                  </div>
                )}
              </div>
            </Card>
            <div className="mx-auto max-w-3xl pt-5">
              <h1 className="text-3xl text-center sm:text-left sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                Let's adventure together.
              </h1>
              <p className="text-lg text-center sm:text-left sm:text-xl text-accents-6">
                Make the best use of your productivity software by integrating
                it into our app.
              </p>
            </div>
            <Card
              title="Your Name"
              description="Please enter your first name, or a display name you are comfortable with."
              footer={
                <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                  <p className="pb-4 sm:pb-0 w-full sm:w-3/4">
                    Please use 64 characters at maximum.
                  </p>
                  <Button
                    className="w-full sm:w-auto"
                    variant="incognito"
                    type="submit"
                    onClick={() =>
                      updateProfile({
                        full_name
                      })
                    }
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving ...' : 'Save'}
                  </Button>
                </div>
              }
            >
              <Input
                htmlFor="full_name"
                className="text-xl mt-8 mb-4 font-semibold rounded"
                id="full_name"
                type="text"
                value={full_name || ''}
                onChange={setName}
              />
            </Card>
            <Card
              title="Connect To Notion"
              description="Integrate any database to start earning rewards for your wins."
              footer={
                <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                  <p className="pb-4 sm:pb-0 w-full">
                    We take your data protection and privacy seriously. After
                    saving, we will describe in detail how our application will
                    use your data and calculate your wins.
                  </p>
                  {/* <Button
                    className="w-full sm:w-auto"
                    variant="incognito"
                    type="submit"
                    onClick={() => setShowSaveModal(true)}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Loading ...' : 'Continue'}
                  </Button> */}
                </div>
              }
            >
              <div className="hidden sm:block text-md text-accents-5 mt-1">
                Works best with success plan from{' '}
                <a
                  className="text-emerald-500 font-semibold"
                  href="https://toolbox.co-x3.com/L-CTRL"
                  target="_blank"
                >
                  L-CTRL
                </a>{' '}
                or{' '}
                <a
                  className="text-emerald-500 font-semibold"
                  href="https://toolbox.co-x3.com/gamify-life"
                  target="_blank"
                >
                  Gamify Your Life!
                </a>
              </div>
              {notionCredentials
                ? notionCredentials.map((credentials) => (
                    <ConnectNotion
                      credentials={credentials}
                      getNotionCredentials={getNotionCredentials}
                      setShowSaveModal={setShowSaveModal}
                    />
                  ))
                : null}
              {notionCredentials ? (
                notionCredentials.length < 5 ? (
                  <div className="flex items-center my-6">
                    <div
                      className="border-t border-accents-2 flex-grow mr-3"
                      aria-hidden="true"
                    ></div>
                    <button
                      onClick={() => addCredentials()}
                      className="text-emerald-500 mx-auto font-semibold"
                    >
                      {notionCredentials.length == 0
                        ? 'Connect To A Database'
                        : 'Connect Additional Databases'}
                    </button>
                    <div
                      className="border-t border-accents-2 flex-grow ml-3"
                      aria-hidden="true"
                    ></div>
                  </div>
                ) : null
              ) : null}
            </Card>
            <div className="flex mx-auto items-center my-6 max-w-3xl">
              <div
                className="border-t border-accents-2 flex-grow mr-3"
                aria-hidden="true"
              ></div>
              <div className="text-accents-4">
                By continuing, you are agreeing to our privacy policy and terms
                of use.
              </div>
              <div
                className="border-t border-accents-2 flex-grow ml-3"
                aria-hidden="true"
              ></div>
            </div>
            <Card
              title="Connect Other Productivity Tools"
              description="Airtable, Clickup, Asana, and more."
              footer={
                <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                  <p className="pb-4 sm:pb-0">
                    Coming soon! Vote on which ones you want us to focus on{' '}
                    <a
                      className="text-emerald-500 font-semibold"
                      href="https://toolbox.co-x3.com/family-connection"
                      target="_blank"
                    >
                      here.
                    </a>
                  </p>
                  {/* <Button className="w-full sm:w-auto"
                variant="slim"
              >
                Learn More
              </Button> */}
                </div>
              }
            ></Card>
            {/* <Card
              footer={
                <div className="text-center">
                  <p className="pb-4 sm:pb-0">
                    By continuing, you are agreeing to our privacy policy and
                    terms of use.
                  </p>
                </div>
              }
            >
              <Button
                className="w-full"
                variant="prominent"
                type="submit"
                onClick={() =>
                  updateProfile({
                    full_name,
                    notion_api_secret,
                    notion_success_plan
                  })
                }
                disabled={saveLoading}
              >
                {saveLoading ? 'Loading ...' : 'Save & Test Connection'}
              </Button>
            </Card> */}
          </div>
        </div>
      </section>

      {showSaveModal ? (
        <>
          <div className="h-screen flex justify-center">
            <div
              className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              // onClick={() => setShowModal(false)}
            >
              <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                    <h3 className="text-2xl font-semibold text-white">
                      🕺 Woohoo! You're almost there!
                    </h3>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 text-blueGray-500">
                    <img
                      src="img/hi-five.gif"
                      height="auto"
                      className="h-96 mx-auto pb-2"
                    />
                    <div className="text-center">
                      <p className="text-xl mt-5 text-primary-2 font-semibold">
                        There's no time to waste - let's connect!
                      </p>
                    </div>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <Link href="/notion-api-validator">
                      <Button
                        className="w-full"
                        variant="prominent"
                        onClick={() => setLoading(true)}
                      >
                        Test Connection
                      </Button>
                    </Link>
                  </div>
                  <div className="text-center mb-6">
                    <button
                      className="text-md font-semibold text-red-600"
                      onClick={() => setShowSaveModal(false)}
                    >
                      I'll do this later!
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </div>
        </>
      ) : null}
    </>
  );
}

export async function getServerSideProps({ req }) {
  try {
    // Get credentials from Supabase
    const { user } = await supabase.auth.api.getUserByCookie(req);

    if (!user) {
      return {
        redirect: {
          destination: '/signin',
          permanent: false
        }
      };
    }

    // Check for purchases from airtable

    const purchaseRecord = await table
      .select({
        filterByFormula: `{customer_email} = '${user.email}'`,
        view: 'App - Purchase List',
        sort: [{ field: 'value', direction: 'desc' }]
      })
      .firstPage();
    return {
      props: {
        initialPurchaseRecord: minifyRecords(purchaseRecord)
      }
    };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    };
  }
}
