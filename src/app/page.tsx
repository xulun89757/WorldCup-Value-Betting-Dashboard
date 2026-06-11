import { DashboardClient } from "@/components/dashboard-client";
import { bankroll, bets, matches } from "@/lib/data";

export default function DashboardPage() {
  return (
    <DashboardClient
      initialBankroll={bankroll.initialBankroll}
      initialBets={bets}
      matches={matches}
    />
  );
}
