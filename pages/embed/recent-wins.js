import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        utility={'recent-wins'}
        hideAttribution={true}
        hideShareWithFamily={false}
        hideDelete={false} />
    </>
  );
}