import { MatchesClient } from "@/components/matches-client";
import { bankroll, bets, matches } from "@/lib/data";

export default function MatchesPage() {
  return (
    <MatchesClient
      initialBankroll={bankroll.initialBankroll}
      initialBets={bets}
      matches={matches}
    />
  );
}
