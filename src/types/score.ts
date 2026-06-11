export type ScoreLine = {
  homeGoals: number;
  awayGoals: number;
  probability: number;
};

export type GoalMarginPrediction = {
  homeByOne: number;
  homeByTwoPlus: number;
  draw: number;
  awayByOne: number;
  awayByTwoPlus: number;
};

export type TotalsPrediction = {
  over25: number;
  under25: number;
};

export type ScorePrediction = {
  expectedGoals: {
    home: number;
    away: number;
  };
  topScores: ScoreLine[];
  goalMargins: GoalMarginPrediction;
  totals: TotalsPrediction;
};
