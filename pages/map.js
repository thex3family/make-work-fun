import Link from 'next/link';
import Button from '@/components/ui/Button';
import CardMap from '@/components/Cards/CardMap';
import { useEffect, useState } from 'react';

export default function map({ metaBase, setMeta }) {
  // sets the meta tags

  useEffect(() => {
    const meta = {
      title: 'World Map - ' + metaBase.titleBase,
      description: 'Join intentional spaces for you to learn and grow together with like-minded adventurers!'
    }
    setMeta(meta)
  }, []);

  const [benefitTab, setBenefitTab] = useState(1);

  return (
    <section className="justify-center">
      <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            World Map
          </h1>
          <p className="text-xl text-accents-5 text-center sm:text-2xl max-w-2xl m-auto">
            Join intentional spaces for you to learn and grow together with
            like-minded adventurers!
          </p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto mb-10'>
          <div onClick={() => setBenefitTab(1)} className={`p-6 rounded-xl cursor-pointer ${benefitTab == 1 ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl' : 'text-gray-600'}`}>
            <i className="text-3xl fas fa-user-circle mb-3" />
            <h2 className='text-xl font-bold mb-1'>Join The Family
              <span className={`text-xs font-semibold ml-2 py-1 px-2 uppercase rounded ${benefitTab == 1 ? 'text-emerald-600 bg-emerald-200' : 'text-gray-200 bg-gray-600'}`}>
                Recommended 👍
              </span></h2>
            <p className='text-lg leading-tight font-medium'>Hang out with comrades before embarking on your next big adventure. Ask questions and RSVP for upcoming events!</p>
          </div>
          <div onClick={() => setBenefitTab(2)} className={`p-6 rounded-xl cursor-pointer ${benefitTab == 2 ? 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 shadow-xl' : 'text-gray-600'}`}>
            <i className="text-3xl fas fa-star mb-3" />
            <h2 className='text-xl font-bold mb-1'>Explore The Metaverse
              <span className={`text-xs font-semibold ml-2 py-1 px-2 uppercase rounded ${benefitTab == 2 ? 'text-emerald-600 bg-emerald-200' : 'text-gray-200 bg-gray-600'}`}>
                New ✨
              </span></h2>
            <p className='text-lg leading-tight font-medium'>Quest together with other adventurers and have meaningful discussions, co-work, or just have fun.</p>
          </div>
        </div>
        <div>
          {benefitTab == 1 ?
            <>
              <iframe 
                className="w-full rounded"
                height="1000"
                allowFullScreen="true"
                src="https://our.x3.family?iframe=true">
                </iframe>
              {/* <div className="mt-6 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2 animate-fade-in-up">
                <CardMap
                  name="The Tavern"
                  img_url="img/the-tavern.jpg"
                  desc="The starting place for all adventurers - find like-minded friends."
                  emojis="💬"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/9f7b04a7-edb3-4916-a110-92891beda1ae/chat"
                  availability="all"
                />
                <CardMap
                  name="Great Hall"
                  img_url="img/great-hall.jpg"
                  desc="Hang out with comrades before embarking on your next big adventure."
                  emojis="🗣 💬"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/156d818e-5d78-4302-b68a-99961906eaeb/stream"
                  availability="family"
                />
                <CardMap
                  name="Make Work Fun"
                  img_url="img/family-connection.jpg"
                  desc="Talk about the makework.fun app, and make friends with other players!"
                  emojis="💬"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/8dd9fd6d-cd47-47e0-8a2c-3e7d87034d69/chat"
                  availability="all"
                />
                <CardMap
                  name="Share Wins"
                  img_url="img/share-wins.jpg"
                  desc="Start meaningful discussions on your recent wins and support each other."
                  emojis="💬"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/43bb8933-cd8a-4ec2-90c8-607338b60c38/chat"
                  availability="all"
                />
                <CardMap
                  name="Events Calendar"
                  img_url="img/get-stuff-done.jpg"
                  desc="RSVP for learning opportunities and co-create with the family."
                  emojis="📅"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/7d8b697f-85c4-491d-9e16-6ba618b44cf1/calendar"
                  availability="all"
                />
                <CardMap
                  name="Workspace Inspo"
                  img_url="img/workspace-inspo.jpg"
                  desc="Get inspired by others on how they set up their work and play stations."
                  emojis="🖼"
                  url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/250043b8-6077-4de8-a70d-cb1fae8c6416/media"
                  availability="family"
                />
              </div> */}
            </>
            :
            <div className='relative flex flex-col justify-center'>

              <video className="relative rounded-xl animate-fade-in-up" autoplay="" loop={true}><source src="/vid/gather-demo.mp4" />
              </video>
              <a href="https://app.gather.town/app/CxOkO4jP0Q4UY6rt/thex3family" target="_blank" className='mx-auto '>
                <Button
                  className="w-auto my-4 animate-fade-in-up"
                  variant="prominent"
                >
                  Visit Our Space
                </Button>
              </a>
            </div>

          }

        </div>
        {/* <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Plaza
          </h1>
          <p className="text-lg sm:text-xl text-accents-6">
            Join chat and voice channels to meet and make new friends on your journey.
          </p>
          <div className="mt-6 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            <CardMap
              name="The Tavern"
              img_url="img/the-tavern.jpg"
              desc="The starting place for all adventurers - find like-minded friends."
              emojis="💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/9f7b04a7-edb3-4916-a110-92891beda1ae/chat"
              availability="all"
            />
            <CardMap
              name="Great Hall"
              img_url="img/great-hall.jpg"
              desc="Hang out with comrades before embarking on your next big adventure."
              emojis="🗣 💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/156d818e-5d78-4302-b68a-99961906eaeb/stream"
              availability="family"
            />
            <CardMap
              name="Get Stuff Done"
              img_url="img/get-stuff-done.jpg"
              desc="Quest together with other adventurers and complete pomodoros together."
              emojis="🗣 💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/6a3b1e3e-1e95-4f57-8791-608cd56ced36/stream"
              availability="family"
            />
            <CardMap
              name="The Library"
              img_url="img/adventurers-guild.jpg"
              desc="A quiet space for retrospection and serene working - with good company."
              emojis="🗣 💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/6a3b1e3e-1e95-4f57-8791-608cd56ced36/stream"
              availability="family"
            />
          </div>
        </div> */}
        {/* <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Dungeons
          </h1>
          <p className="text-lg sm:text-xl text-accents-6">
            Join specialty spaces to solve specific problems.
          </p>
          <div className="mt-6 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            <CardMap
              name="Make Work Fun"
              img_url="img/family-connection.jpg"
              desc="Talk about the makework.fun app, and make friends with other players!"
              emojis="💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/8dd9fd6d-cd47-47e0-8a2c-3e7d87034d69/chat"
              availability="all"
            />
          </div>
        </div> */}
        {/* <div className="mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            City Hall
          </h1>
          <p className="text-lg sm:text-xl text-accents-6">
            Share knowledge and action with the community to level up together.
          </p>
          <div className="mt-6 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            <CardMap
              name="Share Wins"
              img_url="img/share-wins.jpg"
              desc="Start meaningful discussions on your recent wins and support each other."
              emojis="💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/43bb8933-cd8a-4ec2-90c8-607338b60c38/chat"
              availability="all"
            />
            <CardMap
              name="Workspace Inspo"
              img_url="img/workspace-inspo.jpg"
              desc="Get inspired by others on how they set up their work and play stations."
              emojis="🖼"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/250043b8-6077-4de8-a70d-cb1fae8c6416/media"
              availability="family"
            />
          </div>
        </div> */}
      </div>
    </section>
  );
}
