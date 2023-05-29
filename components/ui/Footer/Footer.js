import Link from 'next/link';
import UpdateNotes from '@/utils/updates.json';
let latestUpdate = UpdateNotes[0];

export default function Footer() {
  return (
    <footer className="mx-auto max-w-8xl px-6 py-10 pb-32 bg-primary-1">
      <div className="py-4 space-y-4 bg-primary-1">
        <div className="text-center">
          <p><a className="text-primary align-middle font-semibold hideLinkBorder" href="/new" target="_blank">v.{latestUpdate.version}</a></p>
          <a href="https://co-x3.com/?utm_source=makeworkfun" target="_blank" aria-label="Co-x3 Family" className='hideLinkBorder'>
            <img
              src="/img/supported_by_white.png"
              alt="Co-x3 Family"
              className="inline-block h-6 ml-4 text-primary"
            />
          </a>
          <p className="mt-1 text-sm text-primary align-middle">© All Rights Reserved</p>
          <p className="mt-4 text-sm text-emerald-500 align-middle font-semibold"><a className="hideLinkBorder" target="_blank" href="/docs/privacy-policy">Privacy Policy</a> | <a className="hideLinkBorder" target="_blank"  href="/docs/terms-of-use">Terms Of Use</a> | <a className="hideLinkBorder" target="_blank" href="https://github.com/orgs/thex3family/projects/2/views/1">Roadmap</a></p>
        </div>
      </div>
    </footer>
  );
}
