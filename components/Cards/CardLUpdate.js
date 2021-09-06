import React from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CardLUpdate({ date, title, desc, desc2, img_url, button_url, version }) {
  return (
    <>
      {/* left card start */}
      <div className="col-start-1 col-end-4 text-center z-10">
        <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
          {date}
        </span>
      </div>
      <div className="sm:col-start-1 col-span-3 md:col-start-1 md:col-end-3 col-end-4  my-4 mb-12 p-8 bg-primary-2 rounded w-full z-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{title}</h2>
        <p className="text-lg sm:text-xl mb-5">{desc}</p>
        <p className="text-lg sm:text-xl mb-5">{desc2}</p>
        <Link href={button_url}><img className="mb-4 m-auto cursor-pointer" src={img_url} /></Link>
        {button_url ? <div className="text-center"><Link href={button_url}><Button className="w-auto mx-auto" variant="prominent">See it in action!</Button></Link></div> : ""}
        <p className="text-sm font-semibold text-right mr-4">{version}</p>
      </div>
      {/* left card end */}
    </>
  );
}
