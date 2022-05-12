import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-8xl px-6 py-10 pb-32 bg-primary-1">
      <div className="py-4 space-y-4 bg-primary-1">
        <div className="text-center">
          <span className="text-primary align-middle font-semibold">Version 0.40</span>
          <a href="https://co-x3.com/?utm_source=makeworkfun" target="_blank" aria-label="Co-x3 Family">
            <img
              src="/img/co-x3logo_white_full.png"
              alt="Co-x3 Family"
              className="inline-block h-6 ml-4 text-primary"
            />
          </a>
          <p className="mt-4 text-sm text-primary align-middle">Created with ♥ by the <a href="https://co-x3.com/?utm_source=makeworkfun" target="_blank" className="">Co-x3 Family</a></p>
          <p className="mt-1 text-sm text-primary align-middle">© All Rights Reserved</p>
          <p className="mt-4 text-sm text-emerald-500 align-middle font-semibold"><Link href="/docs/privacy-policy">Privacy Policy</Link> | <Link href="/docs/terms-of-use">Terms Of Use</Link></p>
        </div>
      </div>
    </footer>
  );
}
