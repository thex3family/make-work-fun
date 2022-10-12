import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        utility={'recent-wins-public'}
        hideShareWithFamily={true}
        hideDelete={true} />
    </>
  );
}