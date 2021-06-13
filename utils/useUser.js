import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './supabase-client';

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const [userLoaded, setUserLoaded] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userOnboarding, setUserOnboarding] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setSession(session);
    setUser(session?.user ?? null);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const getUserDetails = () => supabase.from('leaderboard').select('*').eq('player', user.id).single();
  const getUserOnboarding = () => supabase.from('onboarding').select('*').eq('id', user.id).single();
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();

  useEffect(() => {
    if (user) {
      Promise.allSettled([getUserDetails(), getUserOnboarding(), getSubscription()]).then(
        (results) => {
          setUserDetails(results[0].value.data);
          setUserOnboarding(results[1].value.data);
          setSubscription(results[2].value.data);
          setUserLoaded(true);
        }
      );
    }
  }, [user]);

  const value = {
    session,
    user,
    userDetails,
    userOnboarding,
    userLoaded,
    subscription,
    signIn: (options) => supabase.auth.signIn(options),
    signUp: (options) => supabase.auth.signUp(options),
    signOut: () => {
      setUserDetails(null);
      setUserOnboarding(null);
      setSubscription(null);
      return supabase.auth.signOut();
    }
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
