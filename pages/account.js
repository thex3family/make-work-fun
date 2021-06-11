import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';

import Input from '@/components/ui/Input';

import { supabase } from '../utils/supabase-client';

import Avatar from '@/components/avatar';

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [full_name, setName] = useState(null);
  const [notion_api_secret, setNotionAPISecret] = useState(null);
  const [notion_success_plan, setNotionSuccessPlan] = useState(null);
  const { userLoaded, user, session, userDetails, subscription } = useUser();
  const [avatar_url, setAvatarUrl] = useState(null);

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
        .select(`full_name, notion_api_secret, notion_success_plan, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setName(data.full_name)
        setNotionAPISecret(data.notion_api_secret)
        setNotionSuccessPlan(data.notion_success_plan)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ full_name, notion_api_secret, notion_success_plan, avatar_url }) {
    try {
      setLoading(true)
      const user = supabase.auth.user()


      let { error } =   await supabase
      .from('users')
      .update({
        full_name: full_name,
        notion_api_secret: notion_api_secret,
        notion_success_plan: notion_success_plan,
        avatar_url: avatar_url
      })
      .eq('id', user.id);

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
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

  return (
    <section className="bg-black mb-32">
      <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
          <p className="mt-5 text-xl text-accents-6 sm:text-center sm:text-2xl max-w-2xl m-auto">
            Your details with us.
          </p>
        </div>
      </div>
      <div className="p-4">
        <Card
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
          description="Please enter the email address you want to use to login."
          footer={<p>Options to change email coming soon.</p>}
          >
            <p className="text-xl mt-8 mb-4 font-semibold">
              {user ? user.email : undefined}
            </p>
        </Card>
        <div className="form-widget">
        <Card
          title="Your Name"
          description="Please enter your full name, or a display name you are comfortable with."
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
          description="Gives the application access to your Notion database."
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                This is needed to access your Notion databases. Let Conrad know when this is filled out!
              </p>
              {/* <Button className="w-full sm:w-auto"
                variant="slim"
              >
                Learn More
              </Button> */}
            </div>
          }
        >
        <p className="mt-4 font-semibold">Notion API Secret</p>
        <Input className="text-xl mb-4 font-semibold rounded"
          id="notion_api_secret"
          type="varchar"
          value={notion_api_secret || ''}
          onChange={setNotionAPISecret}
        />
        <p className="mt-4 font-semibold">Success Plan Database ID</p>
        <Input className="text-xl mb-4 font-semibold rounded"
          id="notion_success_plan"
          type="varchar"
          value={notion_success_plan || ''}
          onChange={setNotionSuccessPlan}
        />
        </Card>
        <Card>
          
          <Button className="w-full"
                    variant="slim"
                    type="submit"
                    onClick={() => updateProfile({ full_name, notion_api_secret, notion_success_plan })}
                    disabled={loading}
                    >
                      {loading ? 'Loading ...' : 'Update All'}
          </Button></Card>
          
          </div>
      </div>
    </section>
  );
}
