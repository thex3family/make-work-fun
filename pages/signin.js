import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import GitHub from '@/components/icons/GitHub';
import Input from '@/components/ui/Input';
import LoadingDots from '@/components/ui/LoadingDots';
import { useUser } from '@/utils/useUser';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authView, setAuthView] = useState('magic');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const router = useRouter();
  const { user, signIn, passwordReset, userOnboarding } = useUser();

  const handleSignin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});

    const { error } = await signIn({ email, password });
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    if (!password) {
      setMessage({
        type: 'note',
        content: 'Check your email for the magic link.'
      });
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage({});

    const { error } = await passwordReset(email);
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    if (!password) {
      setMessage({
        type: 'note',
        content:
          'If your account exists, you will receive an email with reset instructions.'
      });
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider) => {
    setLoading(true);
    const { error } = await signIn({ provider });
    if (error) {
      setMessage({ type: 'error', content: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userOnboarding) initializePlayer();
  }, [userOnboarding]);

  useEffect(() => {
    if (!user) setLoading(false);
  }, [user]);

  function initializePlayer() {
    try {
      router.push('/player');
      console.log('Redirecting to player page');
    } catch (error) {
      alert(error.message);
    } finally {
      console.log('InitializedPlayer');
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!user)
    return (
      <div className="flex justify-center height-screen-helper">
        <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
          <div className="flex justify-center pb-12 ">
            <img src="logo-white.svg" width="64px" height="64px" />
          </div>
          <div className="flex flex-col space-y-4">
            {message.content && (
              <div
                className={`${
                  message.type === 'error' ? 'text-error' : 'text-green'
                } border ${
                  message.type === 'error' ? 'border-error' : 'border-green'
                } p-3`}
              >
                {message.content}
              </div>
            )}

            {authView === 'magic' && (
              <form
                onSubmit={handleSignin}
                className="animate-fade-in-up flex flex-col space-y-4 mb-2"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Button
                  variant="prominent"
                  type="submit"
                  loading={loading}
                  disabled={!email.length}
                >
                  Send magic link
                </Button>
              </form>
            )}

            {authView === 'password' && (
              <form
                onSubmit={handleSignin}
                className="animate-fade-in-up flex flex-col space-y-4"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <Button
                  className="mt-1"
                  variant="prominent"
                  type="submit"
                  loading={loading}
                  disabled={!password.length || !email.length}
                >
                  Sign in
                </Button>
              </form>
            )}

            {authView === 'reset' && (
              <form
                onSubmit={handlePasswordReset}
                className="animate-fade-in-up flex flex-col space-y-4 mb-2"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <Button
                  variant="prominent"
                  type="submit"
                  loading={loading}
                  disabled={!email.length}
                >
                  Reset Password
                </Button>
              </form>
            )}

            {authView === 'password' ? (
              <div className="pt-2 text-center text-sm">
                <span className="text-accents-7">Forgot your password?</span>
                {` `}
                <a
                  href="#"
                  className="text-accents-7 text-accent-9 font-bold hover:underline cursor-pointer"
                  onClick={() => {
                    if (authView == 'password') setPassword('');
                    setAuthView('reset');
                    setMessage({});
                  }}
                >
                  Reset.
                </a>
                <div className="flex items-center my-6">
                  <div
                    className="border-t border-accents-2 flex-grow mr-3"
                    aria-hidden="true"
                  ></div>
                  <div className="text-accents-4">Or</div>
                  <div
                    className="border-t border-accents-2 flex-grow ml-3"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            ) : (
              ''
            )}

            <span className="text-center text-sm">
              <a
                href="#"
                className="text-accents-7 text-accent-9 hover:underline cursor-pointer"
                onClick={() => {
                  if (authView) {
                    setPassword('');
                    setMessage({});
                    if (authView === 'magic') {
                      setAuthView('password');
                    } else {
                      setAuthView('magic');
                    }
                  }
                }}
              >
                {`Sign in with ${
                  authView === 'magic' ? 'password' : 'magic link'
                }.`}
              </a>
            </span>

            <span className="pt-1 text-center text-sm">
              <span className="text-accents-7">Don't have an account?</span>
              {` `}
              <Link href="/signup">
                <a className="text-accent-9 font-bold hover:underline cursor-pointer">
                  Sign up.
                </a>
              </Link>
            </span>
          </div>

          {/* <div className="flex items-center my-6">
            <div
              className="border-t border-accents-2 flex-grow mr-3"
              aria-hidden="true"
            ></div>
            <div className="text-accents-4">Or</div>
            <div
              className="border-t border-accents-2 flex-grow ml-3"
              aria-hidden="true"
            ></div>
          </div> */}

          {/* <Button
            variant="slim"
            type="submit"
            disabled={loading}
            onClick={() => handleOAuthSignIn('github')}
          >
            <GitHub />
            <span className="ml-2">Continue with GitHub</span>
          </Button> */}
        </div>
      </div>
    );

  return (
    <div className="h-screen flex justify-center">
      <LoadingDots />
    </div>
  );
};

export default SignIn;
