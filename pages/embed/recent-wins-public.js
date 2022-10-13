import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        utility={'recent-wins-public'}
        hideAttribution={false}
        hideShareWithFamily={true}
        hideDelete={true} />
    </>
  );
}