import LoadingDots from '@/components/ui/LoadingDots';
import { userContent } from '@/utils/useUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RecoverPassword from '@/components/Auth/RecoverPassword';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Auth() {
  const { user } = userContent();
  const router = useRouter();
  const { error_code } = router.query;

  // Redirects user to reset password

  const [recoveryToken, setRecoveryToken] = useState(null);
  const [authState, setAuthState] = useState(null);
  const [message, setMessage] = useState(null);


  useEffect(() => {
    /* Recovery url is of the form
     * <SITE_URL>#access_token=x&refresh_token=y&expires_in=z&token_type=bearer&type=recovery
     * Read more on https://supabase.io/docs/reference/javascript/reset-password-email#notes
     */
    let url = window.location.hash;
    let query = url.substr(1);
    let result = {};


    query.split('&').forEach((part) => {
      const item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });

    if (result.type === 'recovery') {
      setRecoveryToken(result.access_token);
      setAuthState('recovery');
    } else {
      setAuthState('login');
    }

    if (result.error_code === '404') {
      setAuthState('error')
      setMessage(result.error_description);
    }
  }, []);

  useEffect(() => {
    if (user && authState == 'login') router.push('/player');
  }, [user]);

  // need to capture when there is a 404. 

  if (recoveryToken && authState == 'recovery') {
    return (
      <RecoverPassword
        token={recoveryToken}
        setRecoveryToken={setRecoveryToken}
      />
    );
  }

  if (authState == 'error') {
    return (
      <section className="justify-center h-screen flex">
        <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col h-screen">
          <div className="pb-10 m-auto flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Oops! It looks like there's an error.
            </h1>
            <Link href="/signin">
              <Button className="w-auto mx-auto"
                variant="prominent"
              >
                Try Again
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="justify-center h-screen flex">
      <LoadingDots />
    </section>
  );
}