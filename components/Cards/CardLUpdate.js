import React from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CardLUpdate({ date, title, desc, desc2, img_url, button_url, version, button_class, loom_url, latest }) {
  return (
    <>
      {/* left card start */}
      <div className="col-start-1 col-end-4 text-center z-10">
        <span className="text-lg relative font-semibold inline-block py-1 mb-2 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
          {date}
          {latest ?
          <span class="absolute -top-2.5 -right-1.5">
            <div class="inline-flex items-center h-4 w-4 border-2 border-white rounded-full text-xs font-semibold leading-4 bg-red-500 text-white">
            </div>
          </span>
          : null}
        </span>
      </div>
      <div className="sm:col-start-1 col-span-3 md:col-start-1 md:col-end-3 col-end-4  my-4 mb-12 p-8 bg-primary-2 rounded w-full z-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{title}</h2>
        <p className="text-lg sm:text-xl mb-5">{desc}</p>
        <p className="text-lg sm:text-xl mb-5">{desc2}</p>
        {loom_url ? (
          <iframe
            className="w-full mb-4"
            height="315"
            src={loom_url}
            title="How To Hand In Quests"
            frameborder="0"
            allow="accelerometer; 
                    autoplay; 
                    clipboard-write; 
                    encrypted-media; 
                    gyroscope; 
                    picture-in-picture"
          ></iframe>
        ) : <a className={button_class}><Link href={button_url}><img className="mb-4 m-auto cursor-pointer rounded-lg" src={img_url} /></Link></a>}
        {button_url ? <a className={button_class}><div className="text-center"><Link href={button_url}><Button className="w-auto mx-auto" variant="prominent">See it in action!</Button></Link></div></a> : ""}
        <p className="text-sm font-semibold text-right mr-4">{version}</p>
      </div>
      {/* left card end */}
    </>
  );
}
