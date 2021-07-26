import Link from 'next/link';

const BottomNavbar = () => {
  
    return (
	<section id="bottom-navigation" className="block fixed inset-x-0 bottom-0 z-10 bg-gradient-to-r from-emerald-500 to-blue-500 shadow">
		<div id="tabs" className="flex justify-between py-2">
			<Link href="/" className="w-full focus:text-teal-500 hover:text-teal-500 justify-center inline-block text-center pt-2 pb-1">
				
				<span className="tab tab-home block text-sm font-medium">Leaderboard</span>
			</Link>
			<Link href="/player" className="w-full focus:text-teal-500 hover:text-teal-500 justify-center inline-block text-center pt-2 pb-1">
				
				<span className="tab tab-kategori block text-sm font-medium">Player</span>
			</Link>
			<Link href="/dailies" className="w-full focus:text-teal-500 hover:text-teal-500 justify-center inline-block text-center pt-2 pb-1">

				<span className="tab tab-explore block text-sm font-medium">Dailies</span>
			</Link>
		</div>
	</section>
);
    }

export default BottomNavbar;