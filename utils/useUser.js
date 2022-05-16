import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './supabase-client';

import { useUser } from '@supabase/supabase-auth-helpers/react'

// const postData = (url, data = {}) =>
//   fetch(url, {
//     method: 'POST',
//     headers: new Headers({ 'Content-Type': 'application/json' }),
//     credentials: 'same-origin',
//     body: JSON.stringify(data)
//   }).then((res) => res.json());

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const { user, error } = useUser()

  const [userLoaded, setUserLoaded] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userOnboarding, setUserOnboarding] = useState(null);
  const [userProfile, setUserProfile] = useState(null);


  // Legacy Management Auth Management

  // const [subscription, setSubscription] = useState(null);

  // const [session, setSession] = useState(null);
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const session = supabase.auth.session();
  //   setSession(session);
  //   setUser(session?.user ?? null);
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       // setSession(session);
  //       // setUser(session?.user ?? null);
  //       console.log(`Supabase auth event: ${event}`);

  //       // This is what forwards the session to our auth API route which sets/deletes the cookie:
  //       await postData('/api/auth', {
  //         event,
  //         session: session
  //       });
  //       setSession(session);
  //       setUser(session?.user ?? null);
  //     }
  //   );

  //   return () => {
  //     authListener.unsubscribe();
  //   };
  // }, []);

  const getUserDetails = () =>
    supabase.from('leaderboard').select('*').eq('player', user.id).single();
  const getUserOnboarding = () =>
    supabase.from('onboarding').select('*').eq('id', user.id).single().limit(1);
  const getUserProfile = () =>
    supabase.from('users').select('*').eq('id', user.id).single();
  // const getSubscription = () =>
  //   supabase
  //     .from('subscriptions')
  //     .select('*, prices(*, products(*))')
  //     .in('status', ['trialing', 'active'])
  //     .single();

  useEffect(() => {
    if (user) {
      Promise.allSettled([
        getUserDetails(),
        getUserOnboarding(),
        getUserProfile(),
        // getSubscription()
      ]).then((results) => {
        setUserDetails(results[0].value.data);
        setUserOnboarding(results[1].value.data);
        setUserProfile(results[2].value.data);
        // setSubscription(results[3].value.data);
        setUserLoaded(true);
      });
    }
  }, [user]);

  const value = {
    // session,
    user,
    userDetails,
    userOnboarding,
    userProfile,
    userLoaded,
    // subscription,
    passwordReset: (options) =>
      supabase.auth.api.resetPasswordForEmail(options),
    signIn: (options) => 
      supabase.auth.signIn(options),
    signUp: (options) => supabase.auth.signUp(options),
    signOut: () => {
      setUserDetails(null);
      setUserOnboarding(null);
      setUserProfile(null);
      supabase.removeAllSubscriptions();
      // setSubscription(null);
      return supabase.auth.signOut();
    }
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const userContent = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`userDetails must be used within a UserContextProvider.`);
  }
  return context;
};
