export default function CardAvatarSkeleton(){

  return (
    <>
<div className="w-full xs:w-1/2 sm:w-1/2 md:1/3 lg:w-1/3 xl:w-1/4 2xl:w-1/5 shadow-xl">
<div className="bg-primary-2 rounded mx-auto">
  <div className="h-60 bg-gray-600 rounded-tr rounded-tl animate-pulse"></div>

  <div className="p-8">
    <div className="grid grid-cols-4 gap-1 pb-1">
      <div className="row-start-1 col-span-2 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="row-start-2 col-span-3 h-6 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="row-start-3 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse mb-3"></div>
      <div className="row-start-4 col-span-4 h-4 rounded-full bg-gray-600 animate-pulse mb-3"></div>
    </div>

    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="col-span-2 h-10 rounded-sm bg-gray-600 animate-pulse"></div>
    </div>

    <div className="grid grid-cols-4 gap-1 mb-2">
      <div className="row-start-1 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="row-start-2 col-span-4 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
    </div>

    <div className="grid grid-cols-6 gap-1">
      <div className="row-start-1 col-start-4 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="row-start-1 col-start-5 co-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
      <div className="row-start-1 col-start-6 col-span-1 h-4 rounded-sm bg-gray-600 animate-pulse"></div>
    </div>
  </div>
</div>
</div>
</>
  );
  }