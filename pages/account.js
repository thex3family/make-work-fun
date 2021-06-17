import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';
import Input from '@/components/ui/Input';

import { supabase } from '../utils/supabase-client';


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

export default function Account() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [full_name, setName] = useState(null);
  const [notion_api_secret, setNotionAPISecret] = useState(null);
  const [notion_success_plan, setNotionSuccessPlan] = useState(null);
  const { userLoaded, user, session, userDetails, subscription } = useUser();
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/signin');
  }, [user]);

  useEffect(() => {
    if (user) getProfile()
  }, [session])


  async function getProfile() {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      let { data, error, status } = await supabase
        .from('users')
        .select(`full_name, notion_api_secret, notion_success_plan`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setName(data.full_name)
        setNotionAPISecret(data.notion_api_secret)
        setNotionSuccessPlan(data.notion_success_plan)

      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }



  async function updateProfile({ full_name, notion_api_secret, notion_success_plan}) {
    try {
      setLoading(true)
      const user = supabase.auth.user()
      if(!notion_success_plan.includes('-')) {
      const url = notion_success_plan;
      const url2 = url.split('?')[0]
      const url3 = url2.substring(url.lastIndexOf("/") + 1);
      notion_success_plan = url3.substr(0,8) + '-' + url3.substr(8, 4) + '-' + url3.substr(12, 4) + '-' + url3.substr(16, 4) + '-' + url3.substr(20);
      }

      let { error } =   await supabase
      .from('users')
      .update({
        full_name: full_name,
        notion_api_secret: notion_api_secret,
        notion_success_plan: notion_success_plan
      })
      .eq('id', user.id);

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setShowSaveModal(true)
      setLoading(false)
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
          <LoadingDots/>
        </div>
    );
  }

  return (
    <>
    <section className="bg-black mb-32">
      <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Welcome, Hero!
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Why don't you introduce yourself?
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
          title="Your Name"
          description="Please enter your first name, or a display name you are comfortable with."
          footer={<p>Please use 64 characters at maximum.</p>}
        >
          
          <Input htmlFor="full_name" className="text-xl mt-8 mb-4 font-semibold rounded"
            id="full_name"
            type="text"
            value={full_name || ''}
            onChange={setName}
          />
        </Card>
        <Card
          title="Your Notion Credentials"
          description="Connect your workspace to start earning rewards for your wins."
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
              We take your data protection and privacy seriously. In the next step, you'll be walked through how our application will use your data. By continuing, you are agreeing to our privacy policy and terms of use.
              </p>
              {/* <Button className="w-full sm:w-auto"
                variant="slim"
              >
                Learn More
              </Button> */}
            </div>
          }
        >
        <div className="mt-4 flex flex-row justify-between">
        <p className="font-semibold">Notion API Secret</p><a className="text-right font-semibold text-emerald-500" href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection#h_a887bad862" target="_blank">Where do I find this?</a>
        </div>
        <Input className="text-xl mb-4 font-semibold rounded"
          id="notion_api_secret"
          type="varchar"
          placeholder="secret_•••"
          value={notion_api_secret || ''}
          onChange={setNotionAPISecret}
        />
        <div className="mt-2 flex flex-row justify-between">
        <p className="font-semibold">Success Plan (ID)</p><a className="text-right font-semibold text-emerald-500" href="https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection#h_b577a8d246" target="_blank">Where do I find this?</a>
        </div>
        <Input className="text-xl mb-4 font-semibold rounded"
          id="notion_success_plan"
          type="varchar"
          placeholder="https://www.notion.so/•••"
          value={notion_success_plan || ''}
          onChange={setNotionSuccessPlan}
        />
        </Card>
        <Card>
          
          <Button className="w-full"
                    variant="prominent"
                    type="submit"
                    onClick={() => updateProfile({ full_name, notion_api_secret, notion_success_plan })}
                    disabled={loading}
                    >
                      {loading ? 'Loading ...' : 'Save & Test Connection'}
          </Button></Card>
          
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
                🕺 Woohoo! One quest down!
                </h3>
              </div>
              {/*body*/}
              <div className="relative p-6 text-blueGray-500">
                <img src="img/hi-five.gif" height="auto" className="w-3/4 mx-auto pb-2" />
              <div className="text-center">
                  <p className="text-xl mt-5 text-primary-2 font-semibold">
                    No time to waste - let's connect to your database!
                  </p>
                  </div>
              </div>
              {/*footer*/}
              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                <Link href='/notion-api-validator'>
              <Button className="w-full" onClick={() => setLoading(true)}
                    variant="prominent"
                    >Test Connection
          </Button>
          </Link>
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