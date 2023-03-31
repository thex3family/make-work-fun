import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Invalid() {

  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col justify-center">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Credentials Invalid
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Unfortunately we weren't able to connect to your database. We're here to help! Potential reasons may include...
          </p>
          <ol className="text-lg text-accents-6 text-left sm:text-xl max-w-2xl m-auto p-2 pt-6">
            <li>1. The integration may not have access to the database. <a className="text-emerald-500 font-semibold" href='https://academy.co-x3.com/make-work-fun-app/aXV29eQnHfmsNGacNfqLUz/manage-connected-notion-databases-in-the-make-work-fun-app/u6ZWsKRhSeCSYuChKweFt1?utm_source=makeworkfun' target="_blank">Learn more.</a></li>
            <li>2. You may have copied and pasted an <span className="font-semibold">incorrect database url.</span></li>
            <li>3. You may have copied and pasted an <span className="font-semibold">incorrect API key.</span></li>
          </ol>
        </div>
        <a className="mx-auto" href="/account?tab=connect">
          <Button className="w-auto mx-auto my-10"
            variant="prominent"
          >
            Try Again
          </Button>
        </a>
      </div>
    </section>
  )
}