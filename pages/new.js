import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function updates() {

  return (
    <section className="justify-center">
      <div className="max-w-6xl mx-auto py-8 sm:pt-24 px-4 sm:px-6 lg:px-8 my-auto w-full flex flex-col">
        <div className="pb-10">
          <h1 className="text-4xl font-extrabold text-center sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 pb-5">
            Whoa, there’s new stuff!
          </h1>
          <p className="text-xl text-accents-6 text-center sm:text-2xl max-w-2xl m-auto">
            We’re constantly making our app better. Here are some of the of notable new features and improvements that we’ve made.
          </p>
          </div>
          <div className="timeline z-10 grid grid-cols-3">
            {/* start  */}
            
          {/* left card start */}
          <div className="col-start-1 col-end-4 text-center z-10">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
            June, 17, 2021
          </span>
          </div>
          <div className="sm:col-start-1 col-span-3 md:col-start-1 md:col-end-3 col-end-4  my-4 mb-12 p-8 bg-primary-2 rounded w-full z-10">
            <h2 className="text-3xl font-bold mb-3 text-white">Data Validation</h2>
            <p className="text-xl mb-5">We want to help you understand your data easier - so we created a wizard that walks you through your Notion API connection and explains each property we use and how we use it.
            <br /><br />
            Required and optional properties have been revamped and all task management databases can now easily connect to our app.            
            </p>
            <img
            className="m-auto"
            src='updates/0.04.png'
            />
            <p className="text-sm font-semibold text-right mr-4">v.04</p>
          </div>
          {/* left card end */}
          <div className="col-start-1 col-end-4 text-center z-10">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
  June, 14, 2021
</span>
</div>
          <div className="sm:col-start-1 col-span-3 md:col-start-2 col-end-4 my-4 mb-12 p-8 bg-primary-2 rounded w-full z-10">
            <h2 className="text-3xl font-bold mb-3 text-white">Compare Your Growth</h2>
            <p className="text-xl mb-5">Graphs are now functional! Visualize your wins from the last week and compare your stats to how you're doing this week.
            </p>
            <img
            className="mb-4 m-auto"
            src='updates/0.03.PNG'
            />
            <p className="text-sm font-semibold text-right mr-4">v.03</p>
          </div>
          {/* left card start */}
          <div className="col-start-1 col-end-4 text-center z-10">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
            June, 13, 2021
          </span>
          </div>
          <div className="sm:col-start-1 col-span-3 md:col-start-1 md:col-end-3 col-end-4  my-4 mb-12 p-8 bg-primary-2 rounded w-full z-10">
            <h2 className="text-3xl font-bold mb-3 text-white">Improved Onboarding Experience</h2>
            <p className="text-xl mb-5">We wanted to make onboarding easier, so we've built a step by step user journey to help you get started, faster! We've also improved loading logic for smooth app navigation.
            </p>
            <img
            className="m-auto"
            src='updates/0.02.png'
            />
            <p className="text-sm font-semibold text-right mr-4">v.02</p>
          </div>
          {/* left card end */}
          <div className="col-start-1 col-end-4 text-center">
            <span className="text-lg font-semibold inline-block py-1 mb-2 px-2 uppercase rounded text-emerald-600 bg-emerald-200 uppercase last:mr-0 mr-1">
  June, 12, 2021
</span>
</div>
          <div className="col-start-1 col-end-4 my-4 p-8 bg-primary-2 rounded">
            <h2 className="text-3xl font-bold mb-3 text-white">Initial Release</h2>
            <p className="text-xl mb-5">Our goal for our initial release is to create a new gamified experience for your productivity, and starting our community on the journey of co-op for personal development. In our initial release, you can...
            </p><p className="text-lg">
            <b>Connect Your Notion Workspace (Success Plan)</b><br/> 
            🔗 Add your Notion credentials and set which wins you want to connect with the app<br/>
            🔗 Completed entries are displayed in a table on your player dashboard<br />
            🔗 Wins are updated every minute so you never miss a celebration<br />
            <br />
            <b>Enjoy An Immersive Game Experience</b><br/> 
            🎮 Personalize your character by entering your display name and custom avatar image<br/>
            🎮 Each win is automatically assigned gold and exp which builds up your character<br />
            🎮 Earn dynamic rewards with modifiers for types of wins and punctuality<br />
            <br />
            <b>Start Multiplayer For Personal Development</b><br/> 
            🤝 Leaderboard keeps you updated on everybody's stats and latest wins<br/>
            🤝 Get a popup for new wins that you can screenshot to your friends<br />
            🤝 Send a notification to the community for wins you want to announce
            </p>
            <p className="text-sm font-semibold text-right mr-4">v.01</p>
          </div>
          </div>
          <a href="https://toolbox.co-x3.com/family-connection/?utm_source=family-connection" target="_blank" className="mx-auto">
          <Button className="w-auto mx-auto my-10"
              variant="prominent"
              >
              Explore The Roadmap 🚀
          </Button>
          </a>
        
      </div>
    </section>

  );

}