import { GiphyFetch } from '@giphy/js-fetch-api';

export async function generateGIF() {
  const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API);

  // generate a random GIF
  const { data: gifs } = await gf.random({
    tag: 'excited dog cat',
    rating: 'g'
  });

  console.log(gifs)
  return gifs.images.original.url;
}