const knownElo: Record<string, number> = {
  Argentina: 1992,
  France: 1984,
  Brazil: 2016,
  England: 1958,
  Spain: 1962,
  Portugal: 1948,
  Netherlands: 1928,
  Germany: 1906,
  Belgium: 1882,
  Italy: 1878,
  Uruguay: 1864,
  Croatia: 1858,
  Switzerland: 1836,
  Morocco: 1824,
  Japan: 1812,
  USA: 1819,
  Mexico: 1795,
  Senegal: 1798,
  Poland: 1778,
  Denmark: 1885,
};

export function getMockElo(teamName: string) {
  return knownElo[teamName] ?? 1750;
}
