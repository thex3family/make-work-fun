import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, Fragment } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { userContent } from '@/utils/useUser';
import { postData } from '@/utils/helpers';
import Input from '@/components/ui/Input';

import { supabase } from '@/utils/supabase-client';
import {
  subscription_table,
  product_table,
  minifyRecords
} from '@/utils/airtable';
import ConnectNotion from '@/components/API/ConnectNotion';
import { fetchAPIKeys, fetchNotionCredentials } from '@/components/Fetch/fetchMaster';
import { truncateString } from '@/utils/truncateString';
import { Menu, Transition } from '@headlessui/react';
import ConnectPOST from '@/components/API/ConnectPOST';

function Card({ title, description, footer, children }) {
  return (
    <div className="border border-accents-1	max-w-3xl w-full p rounded-md m-auto my-8 bg-black animate-fade-in">
      <div className="px-5 py-4">
        <h3 className="text-2xl mb-1 font-medium ">{title}</h3>
        <p className="text-accents-5">{description}</p>
        {children}
      </div>
      <div className="border-t border-accents-1 bg-primary-2 p-4 text-accents-3 rounded-b-md">
        {footer}
      </div>
    </div>
  );
}

export default function Account({
  initialPurchaseRecord,
  subscriptionPurchaseRecord,
  inactiveSubscriptionRecord,
  user
}) {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const router = useRouter();
  const [full_name, setName] = useState(null);

  const [notionCredentials, setNotionCredentials] = useState(null);
  const [APIKeys, setAPIKeys] = useState(null);

  const { userLoaded, userDetails, passwordReset } = userContent();
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [activeConnect, setActiveConnect] = useState(1);

  const { tab } = router.query;
  const { via } = router.query;

  useEffect(() => {
    if (tab == 'toolbox') {
      setActiveTab(1);
    }
    if (tab == 'profile') {
      setActiveTab(2);
    }
    if (tab == 'connect') {
      setActiveTab(3);
    }
    if (via == 'notion') {
      setActiveConnect(1);
    }
    if (via == 'api') {
      setActiveConnect(2);
    }
    if (via == 'other') {
      setActiveConnect(3);
    }
  }, []);


  async function changeTab(tab_id) {
    if (tab_id == 1) {
      router.push(`account/?tab=toolbox`, undefined, { shallow: true })
    }
    if (tab_id == 2) {
      router.push(`account/?tab=profile`, undefined, { shallow: true })
    }
    if (tab_id == 3) {
      router.push(`account/?tab=connect`, undefined, { shallow: true })
    }
    setActiveTab(tab_id);
  }

  async function changeActiveConnect(connect_id) {
    if (connect_id == 1) {
      router.push(`account/?tab=connect&via=notion`, undefined, { shallow: true })
    }
    if (connect_id == 2) {
      router.push(`account/?tab=connect&via=api`, undefined, { shallow: true })
    }
    if (connect_id == 3) {
      router.push(`account/?tab=connect&via=other`, undefined, { shallow: true })
    }
    setActiveConnect(connect_id);
  }

  useEffect(() => {
    if (user) getProfile();
    if (user) getNotionCredentials();
    if (user) getAPIKeys();
    if (subscriptionPurchaseRecord)
      getSubscriptionStatus(subscriptionPurchaseRecord[0]);
  }, [user]);

  async function getProfile() {
    try {
      setLoading(true);

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
    setNotionCredentials(await fetchNotionCredentials());
  }

  async function getAPIKeys() {
    setAPIKeys(await fetchAPIKeys());
  }

  async function updateProfile({ full_name }) {
    try {
      setSaveLoading(true);
      // const user = supabase.auth.user();

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

  async function getSubscriptionStatus(subRecord) {
    const subscription_name = JSON.stringify(
      subRecord?.fields.subscription_name
    );
    if (subscription_name?.includes('Co-x2')) {
      setSubscriptionStatus(1);
    } else if (subscription_name?.includes('Co-x3')) {
      setSubscriptionStatus(2);
    } else if (subscription_name?.includes('Our 100')) {
      setSubscriptionStatus(3);
    }
  }

  // Redirect to stripe portal to manage subscription

  // const redirectToCustomerPortal = async () => {
  //   setLoading(true);
  //   const { url, error } = await postData({
  //     url: '/api/create-portal-link',
  //     token: session.access_token
  //   });
  //   if (error) return alert(error.message);
  //   window.location.assign(url);
  //   setLoading(false);
  // };

  // const subscriptionName = subscription && subscription.prices.products.name;
  // const subscriptionPrice =
  //   subscription &&
  //   new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: subscription.prices.currency,
  //     minimumFractionDigits: 0
  //   }).format(subscription.prices.unit_amount / 100);

  // if (loading) {
  //   return (
  //     <div className="h-screen flex justify-center">
  //       <LoadingDots />
  //     </div>
  //   );
  // }

  async function addCredentials() {
    setLoading(true);
    const newRow = {
      player: user.id
    };

    try {
      // const user = supabase.auth.user();

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

  const [message, setMessage] = useState({ type: '', content: '' });

  async function handlePasswordReset(email) {

    setLoading(true);
    setMessage({});

    const { error } = await passwordReset(email);
    if (error) {
      setMessage({ type: 'error', content: error.message });
    } else {
      setMessage({
        type: 'note',
        content:
          'You will receive an email with reset instructions at ' + user.email
      });
    }

    setLoading(false);
  };

  return (
    <>
      <section className="animate-fade-in-up bg-black">
        <div className="max-w-6xl mx-auto pt-8 md:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Welcome, Hero!
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
              Access all your goodies and set up your app here.
            </p>
          </div>
        </div>
        <div className="pb-24 sm:pb-0 text-center bg-dark bg-opacity-40 px-4 sm:px-10 rounded-0 sm:rounded-b relative mt-7 pt-7">
          <div className="mx-auto absolute inset-x-0 -top-7 bg-gray-700 rounded-xl max-w-lg py-2 sm:py-0 sm:h-14 align-middle shadow-xl grid sm:grid-cols-3 place-items-center text-lg fontmedium px-2 gap-2 grid-cols-1">
            <div
              className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 1
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                : 'text-blueGray-500'
                }`}
              onClick={() => changeTab(1)}
            >
              Toolbox
            </div>
            <div
              className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 2
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                : 'text-blueGray-500'
                }`}
              onClick={() => changeTab(2)}
            >
              Profile
            </div>
            <div
              className={`shadow-xl py-2 w-full rounded-lg font-semibold cursor-pointer ${activeTab == 3
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                : 'text-blueGray-500'
                }`}
              onClick={() => changeTab(3)}
            >
              Connect
            </div>
          </div>
        </div>
        <div className='p-4 bg-dark bg-opacity-40'>
          {activeTab == 1 ?
            <Card
              title="Your Personal Toolbox"
              description="The resources you've unlocked to help you level up on your growth journey."
              footer={
                <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                  <p className="pb-4 sm:pb-0 w-full sm:w-3/4">
                    Not seeing everything? Your resources are tied to your
                    email. You are currently logged in as{' '}
                    <b>{user ? user.email : <LoadingDots />}</b>
                  </p>
                  <a
                    href="https://toolbox.co-x3.com/?utm_source=makeworkfun"
                    target="_blank"
                  >
                    <Button className="w-full sm:w-auto" variant="incognito">
                      Visit Toolbox
                    </Button>
                  </a>
                </div>
              }
            >
              <div className="mt-8 mb-4 font-semibold">
                {!userLoaded ? (
                  <div className="h-12 mb-6">
                    <LoadingDots />
                  </div>
                ) : initialPurchaseRecord.length != 0 ? (
                  initialPurchaseRecord.map((purchase) => (
                    <div className="pb-5 flex justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        <div className="flex flex-row items-center">
                          {truncateString(
                            JSON.stringify(purchase.fields.product_name)
                              .replace('[', '')
                              .replaceAll('"', '')
                              .replace(']', ''),
                            40
                          )}
                        </div>
                        <p className="text-sm font-semibold inline-block rounded">
                          <span className="text-accents-5">Version: </span>
                          <span className="px-1.5 mr-0.5 bg-gray-300 border border-gray-800 rounded text-gray-800">
                            Notion
                          </span>
                          {purchase.fields.subscription_type ? (
                            <span className="px-1.5 bg-emerald-300 border border-emerald-800 rounded text-emerald-800">
                              {purchase.fields.subscription_type}
                            </span>
                          ) : (
                            <span className="px-1.5 bg-yellow-300 border border-yellow-800 rounded text-yellow-800">
                              One-Off
                            </span>
                          )}
                          {purchase.fields.update_page ? (
                            <a
                              href={purchase.fields.update_page}
                              className="ml-2 text-emerald-500"
                            >
                              ✨ Get Latest Version! ✨
                            </a>
                          ) : null}
                        </p>
                        <p className="text-accents-5 text-sm">
                          Unlocked On:
                          <span className="ml-1 text-accents-3">
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
                          >
                            Download
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
                          >
                            Get Template
                          </Button>
                        </a>
                      }
                    </div>
                  </div>
                )}

                <div
                  className="border-t border-accents-2 my-5 mb-8 flex-grow mr-3"
                  aria-hidden="true"
                ></div>
                {!userLoaded ? (
                  <div className="h-12 mb-6">
                    <LoadingDots />
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl">
                      Level Up 10x Faster With Benefits For Our
                      Patrons
                    </p>
                    <p className="text-accents-5 mb-3 font-normal">
                      If you're having trouble seeing your active subscription, please{' '}
                      <a className="launch_intercom cursor-pointer font-semibold text-emerald-500">
                        let us know.
                      </a>
                    </p>
                    {subscriptionPurchaseRecord[0] ? (
                      <>
                        <div className="py-3 px-5 my-5 flex justify-between flex-col sm:flex-row sm:items-center bg-emerald-500 bg-opacity-20 border-2 border-emerald-500 border-opacity-80 rounded">
                          <p className="sm:pb-0 pb-3">
                            <div className="flex flex-row items-center">
                              <span>
                                {subscriptionPurchaseRecord[0].fields
                                  .subscription_name}
                              </span>
                            </div>

                            <p className="text-accents-5 text-sm">
                              Status:
                              <span className="ml-1.5 text-sm px-1 bg-emerald-300 border border-emerald-800 rounded text-emerald-800">
                                Active
                              </span>
                            </p>
                            <p className="text-accents-5 text-sm">
                              Joined On:
                              <span className="ml-1 text-accents-3">
                                {
                                  subscriptionPurchaseRecord[0].fields.joined_on.split(
                                    'T'
                                  )[0]
                                }
                              </span>
                            </p>
                            <p className="text-accents-5 text-sm">
                              Streak:{' '}
                              {Array.from(
                                { length: subscriptionPurchaseRecord[0].fields.streak },
                                (_, i) => (
                                  <span key={i}>⭐</span>
                                )
                              )}
                            </p>

                          </p>
                          {
                            <a className="launch_intercom">
                              <Button
                                className="w-full sm:w-auto text-sm"
                                variant="incognito"
                              >
                                Manage Subscription
                              </Button>
                            </a>
                          }
                        </div>
                      </>
                    ) : (inactiveSubscriptionRecord[0] ?
                      <>
                        <div className="py-3 px-5 my-5 flex justify-between flex-col sm:flex-row sm:items-center bg-red-500 bg-opacity-20 border-2 border-red-500 border-opacity-80 rounded">
                          <p className="sm:pb-0 pb-3">
                            <div className="flex flex-row items-center">
                              <span>
                                {inactiveSubscriptionRecord[0].fields
                                  .subscription_name}
                              </span>
                            </div>

                            <p className="text-accents-5 text-sm">
                              Status:<span className="ml-1.5 text-sm px-1 bg-red-300 border border-red-800 rounded text-red-800">
                                Inactive
                              </span>
                            </p>
                            <p className="text-accents-5 text-sm">
                              Ended On:
                              <span className="ml-1 text-accents-3">
                                {
                                  inactiveSubscriptionRecord[0].fields.expires_on.split(
                                    'T'
                                  )[0]
                                }
                              </span>
                            </p>
                            <p className="text-accents-5 text-sm">
                              Streak:{' '}
                              {Array.from(
                                { length: inactiveSubscriptionRecord[0].fields.streak },
                                (_, i) => (
                                  <span key={i}>⭐</span>
                                )
                              )}
                            </p>

                          </p>
                          {
                            <a href="https://toolbox.co-x3.com/support-us?utm_content=resubscribe" target="_blank">
                              <Button
                                className="w-full sm:w-auto text-sm"
                                variant="incognito"
                              >
                                Continue Support
                              </Button>
                            </a>
                          }
                        </div>
                      </>
                      : null
                    )}
                    <div className="pb-5 mt-8 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        <span
                          className={
                            subscriptionStatus == 1 ? 'text-emerald-500' : null
                          }
                        >
                          Gamify Your Life
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 2 ? 'text-emerald-500' : null
                          }
                        >
                          L-CTRL System
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 3 ? 'text-emerald-500' : null
                          }
                        >
                          Entire Toolbox
                        </span>
                        <p className="text-accents-5 text-sm">
                          Access to our most comprehensive, ready-made, fully
                          customizable systems.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a
                          href={
                            subscriptionPurchaseRecord[0].fields.download_url
                          }
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            Download
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        System Discount @ {' '}
                        <span
                          className={
                            subscriptionStatus == 1 ? 'text-emerald-500' : null
                          }
                        >
                          5%
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 2 ? 'text-emerald-500' : null
                          }
                        >
                          10%
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 3 ? 'text-emerald-500' : null
                          }
                        >
                          100%
                        </span>
                        <p className="text-accents-5 text-sm">
                          Unlock the systems you need at exclusive discounts.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a href="https://toolbox.co-x3.com/products?utm_source=makeworkfun" target="_blank">
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            <i className='fa fa-shopping-cart mr-2'/>{subscriptionStatus == 1 ? "PATRON-GROW-5" : subscriptionStatus == 2 ? "PATRON-VIP-X3" : subscriptionStatus == 3 ? "OUR-100-RULES" : null}
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div><div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        Merch Discount @ {' '}
                        <span
                          className={'text-emerald-500'
                          }
                        >
                          15%
                        </span>
                        <p className="text-accents-5 text-sm">
                          Get the gear you need to stay focused on what matters most.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a
                          href="https://toolbox.co-x3.com/product#merch"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            <i className='fa fa-shopping-cart mr-2'/> 15-VIP-MERCH
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        Weekly Office Hours
                        <p className="text-accents-5 text-sm">
                          Ask burning questions and build new tools together
                          with the family.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a
                          href="https://join.co-x3.com/events/friday-live-build"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            Save Your Spot
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        VIP Patron Space
                        <p className="text-accents-5 text-sm">
                          Get access to behind the scenes content, exclusive
                          templates, and more.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a
                          href="https://academy.co-x3.com/en/articles/5122951-how-do-i-get-access-to-the-vip-patron-space"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            Get Access
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="pb-5 flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="sm:pb-0 pb-3">
                        Expert Consulting Every{' '}
                        <span
                          className={
                            subscriptionStatus == 1 ? 'text-emerald-500' : null
                          }
                        >
                          Year
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 2 ? 'text-emerald-500' : null
                          }
                        >
                          Quarter
                        </span>{' '}
                        •{' '}
                        <span
                          className={
                            subscriptionStatus == 3 ? 'text-emerald-500' : null
                          }
                        >
                          Month
                        </span>
                        <p className="text-accents-5 text-sm">
                          Deep, focused sessions to help you get ready for the
                          next season.
                        </p>
                      </p>
                      {subscriptionStatus ? (
                        <a href={
                          subscriptionPurchaseRecord[0].fields.consultation_url
                        } target="_blank">
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            Book Now
                          </Button>
                        </a>
                      ) : (
                        <a
                          href="https://toolbox.co-x3.com/support-us?utm_source=makeworkfun"
                          target="_blank"
                        >
                          <Button
                            className="w-full sm:w-auto text-sm"
                            variant="incognito"
                          >
                            🔓 Unlock
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            : activeTab == 2 ? <div className="form-widget">
              {/* <div className="mx-auto max-w-3xl pt-5">
              <h1 className="text-3xl text-center sm:text-left sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                Let's adventure together.
              </h1>
              <p className="text-lg text-center sm:text-left sm:text-xl text-accents-6">
                Make the best use of your productivity software by integrating
                it into our app.
              </p>
            </div> */}
            <form 
            
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile({full_name});
            }}>
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
                      
                      disabled={saveLoading || loading}
                    >
                      {saveLoading ? 'Saving ...' : 'Save'}
                    </Button>
                  </div>
                }
              >
                {!loading ?
                  <Input
                    maxlength="64"
                    htmlFor="full_name"
                    className="text-xl mt-8 mb-4 font-semibold rounded"
                    id="full_name"
                    type="text"
                    placeholder="Anonymous Adventurer"
                    value={full_name || ''}
                    
                    onChange={setName}
                  /> : <div className='mt-8 mb-4'><LoadingDots /></div>}
              </Card>
              </form>
              <Card
                title="Account Management"
                description="Set a password, restart your avatar, and more."
                footer={
                  <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                    <p className="pb-4 sm:pb-0 w-full">
                      More options will be made available soon. If you have questions about your account, <a className="launch_intercom cursor-pointer font-semibold text-emerald-500">
                        let us know.
                      </a>
                    </p>
                  </div>
                }
              >
                {!loading ?
                  <><div className="flex flex-col mt-4">{message.content && (
                    <div
                      className={`${message.type === 'error' ? 'text-error' : 'text-green'
                        } border ${message.type === 'error' ? 'border-error' : 'border-green'
                        } p-3`}
                    >
                      {message.content}
                    </div>
                  )}</div>
                    <Button
                      className="w-full mt-4 mb-4"
                      variant="incognito"
                      type="submit"
                      onClick={() =>
                        handlePasswordReset(user.email)
                      }
                      disabled={loading}
                    >
                      Reset Password
                    </Button></> : <div className='mt-8 mb-4'><LoadingDots /></div>}
              </Card>


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
            </div> : <><div className="flex mx-auto items-center my-6 max-w-3xl">
              <div
                className="border-t border-accents-2 flex-grow mr-3"
                aria-hidden="true"
              ></div>
              <Menu as="div" className="relative inline-block mx-auto text-center">
                <div className='text-2xl font-medium '>
                  <span className=''>Connect Via... </span>
                  <Menu.Button className={`ring-0 bg-gradient-to-r from-emerald-500 to-blue-500 font-medium px-2.5 py-1.5 rounded-md`}
                  >
                    {activeConnect == 1 ? 'Notion' : null}
                    {activeConnect == 2 ? 'API' : null}
                    {activeConnect == 3 ? 'Other' : null}
                    <i
                      className="fas fa-chevron-down w-5 h-5 ml-2"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-gray-700 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1.5 py-1.5 flex-col flex gap-1.5">

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                              }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                            onClick={() => changeActiveConnect(1)}>

                            Notion
                          </button>
                        )}
                      </Menu.Item>
                      {/* <Menu.Item>
                          {({ active }) => (
                            <button
                            className={`${active ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                          }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                            >

                              Airtable
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                            className={`${active ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                          }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                            >

                              Obsidian
                            </button>
                          )}
                        </Menu.Item> */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                              }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                            onClick={() => changeActiveConnect(2)}>

                            API
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white' : 'text-gray-200'
                              }group flex rounded-md items-center w-full px-3 py-2 font-medium`}
                            onClick={() => changeActiveConnect(3)}>

                            Other
                          </button>
                        )}
                      </Menu.Item>

                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <div
                className="border-t border-accents-2 flex-grow ml-3"
                aria-hidden="true"
              ></div>
            </div>
              {activeConnect == 1 ?
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
                  {notionCredentials ? (
                    notionCredentials.map((credentials) => (
                      <ConnectNotion
                        credentials={credentials}
                        getNotionCredentials={getNotionCredentials}
                        setShowSaveModal={setShowSaveModal}
                      />
                    ))
                  ) : (
                    <div className='mb-4 mt-4 '><LoadingDots /></div>
                  )}
                  {notionCredentials ? (
                    notionCredentials.length < 5 ? (

                      <div className="flex items-center my-6">
                        <div
                          className="border-t border-accents-2 flex-grow mr-3"
                          aria-hidden="true"
                        ></div>

                        {!loading ?
                          <button
                            onClick={() => addCredentials()}
                            className="text-emerald-500 mx-auto font-semibold"
                          >
                            {notionCredentials.length == 0
                              ? 'Connect To A Database'
                              : 'Connect Additional Databases'}
                          </button>
                          : <LoadingDots />}
                        <div
                          className="border-t border-accents-2 flex-grow ml-3"
                          aria-hidden="true"
                        ></div>
                      </div>

                    ) : null
                  ) : null}
                </Card>
                : null}
              {/* <div className="flex mx-auto items-center my-6 max-w-3xl">
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
              </div> */}
              {activeConnect == 2 ?
                <><Card
                  title="Submit Win Via API"
                  description="Connect any app to share your wins via your secret API key."
                  footer={
                    <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
                      <p className="pb-4 sm:pb-0 w-full">
                        If you are building an application that can integrate with the Make Work Fun app, please <a className="launch_intercom cursor-pointer font-semibold text-emerald-500">
                          let us know.
                        </a>
                      </p>
                    </div>
                  }
                >

                  {!loading ?
                    <ConnectPOST
                      APIKeys={APIKeys}
                      getAPIKeys={getAPIKeys}
                    />
                    : <div className='mb-4 mt-4 '><LoadingDots /></div>}
                </Card>

                </>
                : null
              }

              {activeConnect == 3 ?
                <>
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
                </>
                : null
              }</>
          }
        </div>
      </section>

      {showSaveModal ? (
        <>
          <div className="animate-fade-in h-screen flex justify-center">
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div
                className="opacity-50 fixed inset-0 z-40 bg-black"
                onClick={() => setShowSaveModal(false)}
              ></div>
              <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen z-50">
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
                    <Button
                      className="w-full"
                      variant="prominent"
                      onClick={() => router.push('/notion-api-validator')}
                    >
                      Test Connection
                    </Button>
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
          destination: '/signin?redirect=account',
          permanent: false
        }
      };
    }

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

    return {
      props: {
        initialPurchaseRecord: minifyRecords(purchaseRecord),
        subscriptionPurchaseRecord: minifyRecords(subscriptionRecord),
        inactiveSubscriptionRecord: minifyRecords(inactiveSubscriptionRecord),
        user
      }
    };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: '/signin?redirect=account',
        permanent: false
      }
    };
  }
}
