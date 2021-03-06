import Button from '@/components/ui/Button';
import CardLUpdate from '@/components/Cards/CardLUpdate';
import CardRUpdate from '@/components/Cards/CardRUpdate';
import { useEffect } from 'react';
import UpdateNotes from '@/utils/updates.json';
import CardUpdate from '@/components/Cards/CardUpdate';

export default function updates({metaBase, setMeta}) {
  useEffect(() => {
    const meta = {
      title: 'Updates - ' + metaBase.titleBase,
      description: 'We’re constantly making our app better. Here are some of the notable new features and improvements that we’ve made.'
    }
    setMeta(meta)
  }, []);

  return (
    <section className="justify-center">
      <div className="animate-fade-in-up max-w-6xl mx-auto py-8 md:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            What's New?
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            We’re constantly making our app better. Here are some of the notable new features and improvements that we’ve made.
          </p>
        </div>
        <div className="timeline z-10 grid grid-cols-3">
        {UpdateNotes.map((update) => (
          <CardUpdate 
            date={update.date}
            title={update.title}
            desc={update.desc}
            desc2={update.desc2}
            img_url={update.img_url}
            button_url={update.button_url}
            version={update.version}
          />
        ))}
          {/* start  */}
          {/* <CardRUpdate
            date="May 17, 2022"
            title="Connect Notion With One-Click"
            desc="With the Notion API officially out of beta, we've leveled up our integration to help you easily connect your wins from Notion."
            img_url="updates/0.41.png"
            button_url="/account?tab=connect&via=notion"
            version="v.41"
          />
          <CardLUpdate
            date="Apr 12, 2022"
            title="Faster Parties"
            desc="We've drastically improved the speed it takes to access your party details, so you can swiftly embark on your adventure."
            
            button_url="/parties"
            version="v.40"
            latest={true}
          />
          <CardRUpdate
            date="Mar 27, 2022"
            title="Let's Get Energized⚡"
            desc="We've made it simple for you to keep track your energy levels during the day to help you be in touch with your body and avoid burnout."
            img_url="updates/0.39.png"
            button_url="/player"
            version="v.39"
          />
          <CardLUpdate
            date="Mar 21, 2022"
            title="Have Clarity On Where You're Leveling Up"
            desc="Determine how your daily quests help you level up by tagging them with the appropriate areas of competence."
            img_url="updates/0.38.png"
            button_url="/dailies/edit"
            version="v.38"
          />
          <CardRUpdate
            date="Mar 11, 2022"
            title="Revamped Account Page"
            desc="We care about your control over the app, so we've created management tools for you and improved navigation within the account page."
            img_url="updates/0.37.png"
            button_url="/account?tab=profile"
            version="v.37"
          />
          <CardLUpdate
            date="Mar 01, 2022"
            title="Create A Story For Your Daily Quests"
            desc="Click on the (i) on any of your daily quests to jot down notes, reminders, and more - creating your own personalized questing experience!"
            img_url="updates/0.36.png"
            button_url="/dailies"
            version="v.36"
          />
          <CardRUpdate
            date="Feb 24, 2022"
            title="Custom API For Developers"
            desc="We made it easy for developers to directly send wins to their avatar via their API secret key for the Make Work Fun app."
            img_url="updates/0.35.png"
            button_url="/account?tab=profile"
            version="v.35"
          />
          <CardLUpdate
            date="Feb 18, 2022"
            title="View Your Avatar Everywhere"
            desc="We know that you want to see your amazing avatar all the time, so we've made your avatar follow you and give updates wherever you go."
            img_url="updates/0.34.png"
            button_url="/signin"
            version="v.34"
          />
          <CardRUpdate
            date="Jan 25, 2022"
            title="Soundtracks To Get You Going"
            desc="Music is one of the best cues to get you into the mindset for getting stuff done, so we've integrated with Spotify to bring you your favourite hits."
            img_url="updates/0.33.png"
            button_url="/signin"
            version="v.33"
          />
          <CardLUpdate
            date="Jan 24, 2022"
            title="Be Intentional With Your Time"
            desc="We've created your very first tool - a pomodoro timer that you can start on your own or with the family that follows you around the app!"
            img_url="updates/0.32.png"
            button_url="/signin"
            version="v.32"
          />
          <CardRUpdate
            date="Jan 20, 2022"
            title="Weekly Leaderboard and Navigation"
            desc="Track how you're measuring against your family on a weekly basis, and enjoy a brand new navigation bar experience in the app."
            img_url="updates/0.31.png"
            button_url="/leaderboard?view=week"
            version="v.31"
          />
          <CardLUpdate
            date="Jan 13, 2022"
            title="Level Up Anytime, Anywhere"
            desc="You have a new embed component to help you hand in dailies directly from Notion. We've also created new customization options together with destructible secret keys to give you full control over your embeds!"
            img_url="updates/0.30.png"
            button_url="/embed?component=dailies"
            version="v.30"
          />
          <CardRUpdate
            date="Jan 09, 2022"
            title="Manage Your Wins"
            desc="We've improved the interface for your win details, so you can easily delete or share it with the family whenever you want."
            img_url="updates/0.29.png"
            button_url="/player"
            version="v.29"
          />
          <CardLUpdate
            date="Jan 01, 2022"
            title="Brand New Season"
            desc="With every quarter we have opportunities for learning and growth. We've reset the seasonal leaderboards and improved navigation around the app."
            img_url="updates/0.28.png"
            button_url="/player"
            version="v.28"
          />
          <CardRUpdate
            date="Dec 5, 2021"
            title="Party Quest Leaderboard"
            desc="We've set up the leaderboard, so you can check out all the parties created this season. You can also now join any party in progress - but be aware, you'll be starting with lower health for being late!"
            img_url="updates/0.27.png"
            button_url="/parties"
            version="v.27"
          />
          <CardLUpdate
            date="Oct 13, 2021"
            title="Personalized Help Experiences"
            desc="We've upgraded our chatbot so you can get personalized help if you need it. Simply click on the blue circle on the bottom right of your screen if you're ever stuck! If you're on mobile, click on ? in the navbar instead."
            img_url="updates/0.26.png"
            button_url="/new"
            button_class="launch_intercom"
            version="v.26"
          />
          <CardRUpdate
            date="Oct 7, 2021"
            title="Dedicated Landing Page"
            desc="We want to make sure you can try out our app's capabilities to its full extent, so we created a playground for you to try out some of our core features - no login required."
            img_url="updates/0.25.PNG"
            button_url="/"
            version="v.25"
          />
          <CardLUpdate
            date="Oct 3, 2021"
            title="Official Public Beta Launch!"
            desc="After 4 months of building together with our family, we're finally ready to share our app to the world - for FREE! We hit the front page of Product Hunt - and couldn't have done it without you guys."
            img_url="updates/0.24.PNG"
            button_url="/player"
            version="v.24"
          />
          <CardRUpdate
            date="Sep 14, 2021"
            title="Reflect After Questing"
            desc="After each party quest, reflect together with your friends to see what went well, what could have been done better, and we can be more helpful to each other."
            img_url="updates/0.23.PNG"
            button_url="/parties"
            version="v.23"
          />
          <CardLUpdate
            date="Sep 05, 2021"
            title="Embark On Party Quests"
            desc="Do tasks with your friends and get extra points! Get the motivation and accountability to get things done - with 2 exciting modes to try!"
            desc2="Join our first batch of parties - we'll announce new ones every week!"
            img_url="updates/0.22.PNG"
            button_url="/parties"
            version="v.22"
          />
          <CardRUpdate
            date="Aug 26, 2021"
            title="Personalize Your Leaderboard!"
            desc="With our latest upgrade to the embed page, make your own leaderboard with your friends' player cards (unlimited!) and stay updated on their wins."
            img_url="updates/0.21.png"
            button_url="/embed"
            version="v.21"
          />
          <CardLUpdate
            date="Aug 23, 2021"
            title="See Today's Earnings On The Leaderboard"
            desc="What does it take to rank up? Get motivated by seeing how your friends and family have been leveling up every day!"
            img_url="updates/0.20.png"
            button_url="/"
            version="v.20"
          />
          <CardRUpdate
            date="Aug 19, 2021"
            title="Embed Your Character Into Your Sites"
            desc="Generate dynamic embeddable components to put into your Notion pages and websites to see your character level in real time."
            img_url="updates/0.19.png"
            button_url="/embed"
            version="v.19"
          />
          <CardLUpdate
            date="Aug 16, 2021"
            title="Choose Your Own Title!"
            desc="Get new titles every 5 levels and proudly display your rank on your player card. Earn exclusive titles by contributing to the family!"
            img_url="updates/0.18.png"
            button_url="/player"
            version="v.18"
          />
          <CardRUpdate
            date="Aug 12, 2021"
            title="Limitless Databases Integration"
            desc="The wait is over - integrate with multiple Notion databases to earn wins for everything you do. Additionally, connect to shared databases and specify who should earn the rewards, enhancing the multiplayer experience."
            img_url="updates/0.17.png"
            button_url="/account"
            version="v.17"
          />
          <CardLUpdate
            date="Aug 08, 2021"
            title="Track Your Life Progression"
            desc="When you handing in wins, specify the area of competence it is improving. Then, click on your avatar in the player page to see your stats in real time."
            img_url="updates/0.16.gif"
            button_url="/player"
            version="v.16"
          />
          <CardRUpdate
            date="Aug 01, 2021"
            title="Customize Your Daily Quests"
            desc="You can now switch between checkbox, counter, time, location, feeling, and note for your dailies to fit all your daily needs!"
            img_url="updates/0.15.png"
            button_url="/dailies"
            version="v.15"
          />
          <CardLUpdate
            date="Jul 29, 2021"
            title="Notifications and Vibrations!"
            desc="Keep your app open to get timely notifications when you accomplish wins and celebrate them with your friends!"
            img_url="updates/0.14.png"
            button_url="/player"
            version="v.14"
          />
          <CardRUpdate
            date="Jul 28, 2021"
            title="More Personalization Options"
            desc="Make your dashboard your own! Set your own custom background for your player page and show it off in the leaderboard."
            img_url="updates/0.13.png"
            button_url="/player"
            version="v.13"
          />
          <CardLUpdate
            date="Jul 27, 2021"
            title="Dailies You Get To Do"
            desc="Create your own quests to do each day, and try to build up a streak. Complete 4 quests to get a bonus reward (resets daily!)"
            img_url="updates/0.12.png"
            button_url="/dailies"
            version="v.12"
          />
          <CardRUpdate
            date="Jul 02, 2021"
            title="Toolbox Purchases Dashboard"
            desc="For the very first time, we have a dedicated dashboard to show you all of your available toolbox resources. Re-download your templates with ease."
            img_url="updates/0.11.png"
            button_url="/account"
            version="v.11"
          />
          <CardLUpdate
            date="Jul 1, 2021"
            title="It's Time To Level Up"
            desc="Our leveling experience now follows a linear growth pattern, and you can now enjoy dynamic level up screens to help you enjoy your journey!"
            img_url="updates/0.10.png"
            button_url="/player"
            version="v.10"
          />
          <CardRUpdate
            date="Jun 30, 2021"
            title="Real Time Rewards"
            desc="You don't need to refresh anymore - keep your app open to see your wins announced in real time with a random loot box! Click on it to unlock an unique celebratory gif - try to collect them all!"
            img_url="updates/0.09.png"
            button_url="/player"
            version="v.09"
          />
          <CardLUpdate
            date="Jun 29, 2021"
            title="Seasonal Leaderboard Rankings"
            desc="Season 1 is coming! Every season will last 3 months, and exp / levels earned within each season and overall will be ranked separately on the leaderboard for fair and friendly competition."
            img_url="updates/0.08.png"
            button_url="/"
            version="v.08"
          />
          <CardRUpdate
            date="Jun 28, 2021"
            title="Grow Together With Family"
            desc="See what your friends are up to and embark on adventures together with a community that cares about your growth journey."
            img_url="updates/0.07.png"
            button_url="/map"
            version="v.07"
          />
          <CardLUpdate
            date="Jun 26, 2021"
            title="Celebrate Your Wins"
            desc="Every time you accomplish a win, a randomized gif will spawn!
            Remember to share your wins to get support and start meaningful
            discussions."
            img_url="updates/0.06.png"
            button_url="/player"
            version="v.06"
          />
          <CardRUpdate
            date="Jun 18, 2021"
            title="Table Magic"
            desc="We've beautified your recent win table. Easily view your latest 10
            wins and look back into historical entries to visualize how you've
            been trending!"
            img_url="updates/0.05.PNG"
            button_url="/player"
            version="v.05"
          />
          <CardLUpdate
            date="Jun 17, 2021"
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
            date="Jun 14, 2021"
            title="Compare Your Growth"
            desc="Graphs are now functional! Visualize your wins from the last week
            and compare your stats to how you're doing this week."
            img_url="updates/0.03.PNG"
            button_url="/player"
            version="v.03"
          />
          <CardLUpdate
            date="Jun 13, 2021"
            title="Improved Onboarding Experience"
            desc="We wanted to make onboarding easier, so we've built a step by step
          user journey to help you get started, faster! We've also improved
          loading logic for smooth app navigation."
            img_url="updates/0.02.png"
            button_url="/account"
            version="v.02"
          /> */}
          <div className="col-start-1 col-end-4 text-center">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
              Jun 12, 2021
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
