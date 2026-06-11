export type TheOddsApiSport = {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
};

export type TheOddsApiOutcome = {
  name: string;
  price: number;
  point?: number;
};

export type TheOddsApiMarket = {
  key: string;
  last_update: string;
  outcomes: TheOddsApiOutcome[];
};

export type TheOddsApiBookmaker = {
  key: string;
  title: string;
  last_update: string;
  markets: TheOddsApiMarket[];
};

export type TheOddsApiEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: TheOddsApiBookmaker[];
};
