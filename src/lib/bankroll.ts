import type { BankrollMetrics } from "@/types/bankroll";
import type { Bet } from "@/types/bet";

export function calculateBankrollMetrics(
  initialBankroll: number,
  bets: Bet[],
): BankrollMetrics {
  const settledBets = bets
    .filter((bet) => bet.status === "settled")
    .sort((a, b) => {
      const aTime = a.settledAt ? new Date(a.settledAt).getTime() : 0;
      const bTime = b.settledAt ? new Date(b.settledAt).getTime() : 0;
      return aTime - bTime;
    });
  const pendingBets = bets.filter((bet) => bet.status === "pending");
  const totalProfit = settledBets.reduce((sum, bet) => sum + bet.profit, 0);
  const currentBankroll = initialBankroll + totalProfit;
  const totalSettledStake = settledBets.reduce((sum, bet) => sum + bet.stake, 0);
  const wonSettledBets = settledBets.filter((bet) => bet.result === "win");

  let bankroll = initialBankroll;
  let peak = initialBankroll;
  let maxDrawdown = 0;
  let currentWinningStreak = 0;
  let currentLosingStreak = 0;
  let winningStreak = 0;
  let losingStreak = 0;

  const bankrollHistory = [
    {
      label: "开始",
      bankroll,
    },
  ];

  settledBets.forEach((bet, index) => {
    bankroll += bet.profit;
    peak = Math.max(peak, bankroll);

    if (peak > 0) {
      maxDrawdown = Math.max(maxDrawdown, (peak - bankroll) / peak);
    }

    if (bet.result === "win") {
      currentWinningStreak += 1;
      currentLosingStreak = 0;
    } else if (bet.result === "loss") {
      currentLosingStreak += 1;
      currentWinningStreak = 0;
    }

    winningStreak = Math.max(winningStreak, currentWinningStreak);
    losingStreak = Math.max(losingStreak, currentLosingStreak);

    bankrollHistory.push({
      label: `第 ${index + 1} 笔`,
      bankroll,
    });
  });

  return {
    initialBankroll,
    currentBankroll,
    totalProfit,
    roi: totalSettledStake > 0 ? totalProfit / totalSettledStake : 0,
    maxDrawdown,
    winningStreak,
    losingStreak,
    totalSettledStake,
    winRate:
      settledBets.length > 0 ? wonSettledBets.length / settledBets.length : 0,
    settledBets: settledBets.length,
    pendingBets: pendingBets.length,
    bankrollHistory,
  };
}
