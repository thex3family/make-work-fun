import React from "react";

export default function CardMap({
  name,
  img_url,
  desc,
  emojis,
  url,
  availability
}) {

    return (
        <>


<div class="shadow-md flex flex-col md:flex-row bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg overflow-hidden transition duration-500 ease-out transform hover:-translate-y-1 ">
      <div class="md:flex-shrink-0">
        <img
          src={img_url}
          alt=""
          class="w-full h-48 object-cover md:h-full md:w-48"
        />
      </div>
      <form class="flex-auto p-6">
        <div class="flex flex-wrap">
          <h1 class="flex-auto text-xl sm:text-2xl font-bold tracking-wide uppercase">
            {name}
          </h1>
          <div class="text-xl font-semibold text-white">{emojis}</div>
          <div class="w-full flex-none text-md text-white my-2">
            {desc}
          </div>
        </div>
        <div class="flex space-x-3 mb-4 text-sm font-medium">
        <a href={url} target="_blank" className="w-full">
          <div class="flex-auto flex space-x-3">
            <button
              class="flex items-center justify-center rounded-md border w-full sm:w-2/3 bg-white text-black px-3 py-2 font-semibold uppercase hover:bg-accents-0 hover:text-primary"
              type="button"
            >
              Visit
            </button>
          </div>
          </a>
        </div>
        <p class="text-sm text-white">{availability == "all" ? "🔓 Open For All Adventurers" : "🔓 Open For Family Members"}{availability == "family" ? <a href="https://join.co-x3.com/?utm_source=makeworkfun" target="_blank"><i className="fas fa-question-circle ml-1.5"/></a>:""}</p>
      </form>
    </div>

</>
);
}