import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        utility={'recent-wins'}
        hideShareWithFamily={false}
        hideDelete={false} />
    </>
  );
}