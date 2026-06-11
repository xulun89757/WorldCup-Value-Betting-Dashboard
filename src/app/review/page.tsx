import { ReviewClient } from "@/components/review-client";
import { bets, matches } from "@/lib/data";

export default function ReviewPage() {
  return <ReviewClient initialBets={bets} matches={matches} />;
}
