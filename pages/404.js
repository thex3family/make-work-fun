import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Custom404() {

    return( 
        <section className="justify-center">
        <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
          <div className="pb-10">
            <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
              Page Not Found
            </h1>
            <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Looks like we stumbled into unknown territory here.
            </p>
            </div>
            <img className="w-3/5 m-auto" src='/img/notfound.png'/>
            <Link href="/">
            <Button className="w-auto mx-auto my-10"
              variant="prominent"
              >
              Take Me Home!
          </Button>
          </Link>
            </div>
            </section>
    )
  }