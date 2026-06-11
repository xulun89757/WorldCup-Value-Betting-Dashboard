import { Suspense } from "react";
import { BankrollManager } from "@/components/bankroll-manager";
import { bankroll, bets, matches } from "@/lib/data";

export default function BankrollPage() {
  return (
    <Suspense fallback={null}>
      <BankrollManager
        initialBankroll={bankroll.initialBankroll}
        initialBets={bets}
        matches={matches}
      />
    </Suspense>
  );
}
