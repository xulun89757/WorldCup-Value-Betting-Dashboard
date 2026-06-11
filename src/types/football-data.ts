export type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: {
    id: number | null;
    name: string | null;
    shortName?: string | null;
    tla?: string;
  };
  awayTeam: {
    id: number | null;
    name: string | null;
    shortName?: string | null;
    tla?: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};

export type FootballDataMatchesResponse = {
  competition: {
    id: number;
    name: string;
    code: string;
  };
  matches: FootballDataMatch[];
};
