import Link from 'next/link';
import Button from '@/components/ui/Button';
import CardMap from '@/components/Cards/CardMap';

export default function map() {
  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            World Map
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            Join intentional spaces for you to learn and grow together with
            like-minded adventurers!
          </p>
        </div>
        <div className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
          Plaza
        </h1>
        <p className="text-lg sm:text-xl text-accents-6">
          Join chat and voice channels to meet and make new friends on your journey.
        </p>
          <div className="mt-6 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            <CardMap
              name="Great Hall"
              img_url="img/great-hall.jpg"
              desc="Hang out with comrades before embarking on your next big adventure."
              emojis="🗣 💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/156d818e-5d78-4302-b68a-99961906eaeb/stream"
              availability="all"
            />
            <CardMap
              name="Get Stuff Done"
              img_url="img/adventurers-guild.jpg"
              desc="Quest together with other adventurers and complete pomodoros together."
              emojis="🗣 💬"
              url="https://www.guilded.gg/thex3family/groups/Gza4RWEd/channels/6a3b1e3e-1e95-4f57-8791-608cd56ced36/stream"
              availability="family"
            />
          </div>
        </div>
        <div className="mb-12">
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
              availability="family"
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
        </div>
      </div>
    </section>
  );
}
