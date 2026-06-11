export type Bankroll = {
  initialBankroll: number;
  currentBankroll: number;
  totalProfit: number;
  roi: number;
  maxDrawdown: number;
  winningStreak: number;
  losingStreak: number;
};

export type BankrollMetrics = Bankroll & {
  totalSettledStake: number;
  winRate: number;
  settledBets: number;
  pendingBets: number;
  bankrollHistory: Array<{
    label: string;
    bankroll: number;
  }>;
};
