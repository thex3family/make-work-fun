import Link from 'next/link';
import Button from '@/components/ui/Button';
import CardLUpdate from '@/components/Cards/CardLUpdate';
import CardRUpdate from '@/components/Cards/CardRUpdate';

export default function updates() {
  return (
    <section className="justify-center">
      <div className="animate-fade-in-up max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Whoa, there’s new stuff!
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            We’re constantly making our app better. Here are some of the of
            notable new features and improvements that we’ve made.
          </p>
        </div>
        <div className="timeline z-10 grid grid-cols-3">
          {/* start  */}
          <CardRUpdate
            date="June 30, 2021"
            title="Real Time Rewards"
            desc="You don't need to refresh anymore - keep your app open to see your wins announced in real time with a random loot box! Click on it to unlock an unique celebratory gif - try to collect them all!"
            img_url="updates/0.09.png"
            button_url="/player"
            version="v.09"
          />
          <CardLUpdate
            date="June 29, 2021"
            title="Seasonal Leaderboard Rankings"
            desc="Season 1 is coming! Every season will last 3 months, and exp / levels earned within each season and overall will be ranked separately on the leaderboard for fair and friendly competition."
            img_url="updates/0.08.png"
            button_url="/"
            version="v.08"
          />
          <CardRUpdate
            date="June 28, 2021"
            title="Grow Together With Family"
            desc="See what your friends are up to and embark on adventures together with a community that cares about your growth journey."
            img_url="updates/0.07.png"
            button_url="/map"
            version="v.07"
          />
          <CardLUpdate
            date="June 26, 2021"
            title="Celebrate Your Wins"
            desc="Every time you accomplish a win, a randomized gif will spawn!
            Remember to share your wins to get support and start meaningful
            discussions."
            img_url="updates/0.06.png"
            button_url="/player"
            version="v.06"
          />
          <CardRUpdate
            date="June 18, 2021"
            title="Table Magic"
            desc="We've beautified your recent win table. Easily view your latest 10
            wins and look back into historical entries to visualize how you've
            been trending!"
            img_url="updates/0.05.PNG"
            button_url="/player"
            version="v.05"
          />
          <CardLUpdate
            date="June 17, 2021"
            title="Data Validation"
            desc="We want to help you understand your data easier - so we created a
            wizard that walks you through your Notion API connection and
            explains each property we use and how we use it."
            desc2="Required and optional properties have been revamped and all task
            management databases can now easily connect to our app."
            img_url="updates/0.04.png"
            button_url="/account"
            version="v.04"
          />
          <CardRUpdate
            date="June 14, 2021"
            title="Compare Your Growth"
            desc="Graphs are now functional! Visualize your wins from the last week
            and compare your stats to how you're doing this week."
            img_url="updates/0.03.PNG"
            button_url="/player"
            version="v.03"
          />
          <CardLUpdate
            date="June 13, 2021"
            title="Improved Onboarding Experience"
            desc="We wanted to make onboarding easier, so we've built a step by step
          user journey to help you get started, faster! We've also improved
          loading logic for smooth app navigation."
            img_url="updates/0.02.png"
            button_url="/account"
            version="v.02"
          />
          <div className="col-start-1 col-end-4 text-center">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
              June 12, 2021
            </span>
          </div>
          <div className="col-start-1 col-end-4 my-4 p-8 bg-primary-2 rounded">
            <h2 className="text-3xl font-bold mb-3 text-white">
              Initial Release
            </h2>
            <p className="text-xl mb-5">
              Our goal for our initial release is to create a new gamified
              experience for your productivity, and starting our community on
              the journey of co-op for personal development. In our initial
              release, you can...
            </p>
            <p className="text-lg">
              <b>Connect Your Notion Workspace (Success Plan)</b>
              <br />
              🔗 Add your Notion credentials and set which wins you want to
              connect with the app
              <br />
              🔗 Completed entries are displayed in a table on your player
              dashboard
              <br />
              🔗 Wins are updated every minute so you never miss a celebration
              <br />
              <br />
              <b>Enjoy An Immersive Game Experience</b>
              <br />
              🎮 Personalize your character by entering your display name and
              custom avatar image
              <br />
              🎮 Each win is automatically assigned gold and exp which builds up
              your character
              <br />
              🎮 Earn dynamic rewards with modifiers for types of wins and
              punctuality
              <br />
              <br />
              <b>Start Multiplayer For Personal Development</b>
              <br />
              🤝 Leaderboard keeps you updated on everybody's stats and latest
              wins
              <br />
              🤝 Get a popup for new wins that you can screenshot to your
              friends
              <br />
              🤝 Send a notification to the community for wins you want to
              announce
            </p>
            <p className="text-sm font-semibold text-right mr-4">v.01</p>
          </div>
        </div>
        <a
          href="https://toolbox.co-x3.com/family-connection/?utm_source=family-connection"
          target="_blank"
          className="mx-auto"
        >
          <Button className="w-auto mx-auto my-10" variant="prominent">
            Explore The Roadmap 🚀
          </Button>
        </a>
      </div>
    </section>
  );
}
