import Link from 'next/link';
import s from './Footer.module.css';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-8xl px-6 bg-primary-1">
      <div className="py-12 space-y-4 bg-primary-1">
        <div className="text-center">
          <span className="text-primary align-middle font-semibold">Version 0.09</span>
          <a href="https://co-x3.com/?utm_source=makeworkfun" aria-label="Co-x3 Family">
            <img
              src="/img/co-x3logo_white_full.png"
              alt="Co-x3 Family"
              className="inline-block h-6 ml-4 text-primary"
            />
          </a>
          <p className="mt-1 text-sm text-primary align-middle font-semi-bold">© All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
