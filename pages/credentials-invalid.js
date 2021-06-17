import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Invalid() {

    return( 
      <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Credentials Incorrect
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
          Unfortunately we weren't able to connect to your database. Let's try to help. Potential reasons may include...
          </p>
          <ol className="text-lg text-accents-6 text-left sm:text-xl max-w-2xl m-auto p-2 pt-6">
          <li>1. The integration may not have access to the database. <a className="text-emerald-500 font-semibold" href='https://academy.co-x3.com/en/articles/5263453-get-started-with-the-co-x3-family-connection#h_57d01e96e0/' target="_blank">Learn more.</a></li>
          <li>2. You may have copied and pasted an <span className="font-semibold">incorrect database url.</span></li>
          <li>3. You may have copied and pasted an <span className="font-semibold">incorrect API key.</span></li>
          </ol>
          </div>
          <Link href="/account">
          <Button className="w-auto mx-auto my-10"
            variant="slim"
            >
            Try Again
        </Button>
        </Link>
          </div>
          </section>
    )
  }