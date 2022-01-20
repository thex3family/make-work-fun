import LoadingDots from '@/components/ui/LoadingDots';
import { useUser } from '@/utils/useUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RecoverPassword from '@/components/Auth/RecoverPassword';

export default function Auth() {
  const { user } = useUser();
  const router = useRouter();

  // Redirects user to reset password

  const [recoveryToken, setRecoveryToken] = useState(null);

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
    }
  }, []);

  useEffect(() => {
    if (user && !recoveryToken) router.push('/player');
  }, [user]);

  if (recoveryToken) {
    return (
      <RecoverPassword
        token={recoveryToken}
        setRecoveryToken={setRecoveryToken}
      />
    );
  }


  return (
    <section className="justify-center h-screen flex">
      {/* <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col h-screen">
                <div className="pb-10 m-auto flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
                        Loading Your Avatar...
                    </h1> */}
      <LoadingDots />
      {/* </div>
            </div> */}
    </section>
  )
}