import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        hideShareWithFamily={false}
        hideDelete={false} />
    </>
  );
}