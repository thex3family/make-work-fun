import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getActiveProductsWithPrices = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
    throw error;
  }

  return data || [];
};

// For some reason this doesn't work when the user isn't signed in yet...

// export const updateUserName = async (user, name) => {
//   console.log(user);
//   console.log(name);
//   const { data, error } = await supabase
//     .from('users')
//     .update({full_name: name}).eq('id', user.id);
//     if (error) {
//       alert(error.message);
//       throw error;
//     }
// };
