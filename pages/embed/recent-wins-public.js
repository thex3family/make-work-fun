import RecentWins from "@/components/Embeds/recent-wins";

export default function recentWinsWrapper() {
  return (
    <>
      <RecentWins
        hideShareWithFamily={true}
        hideDelete={true} />
    </>
  );
}