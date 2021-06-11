import Link from 'next/link';
import Pricing from '@/components/Pricing';
import { getActiveProductsWithPrices } from '@/utils/supabase-client';
import Button from '@/components/ui/Button';
import Avatar from '@/components/Cards/CardAvatar';

export default function PricingPage({ products }) {
  return <Pricing products={products} />;

}

export async function getStaticProps() {
  const products = await getActiveProductsWithPrices();

  return {
    props: {
      products
    },
    revalidate: 60
  };
}
