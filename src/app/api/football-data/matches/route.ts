import { NextResponse } from "next/server";
import type { FootballDataMatchesResponse } from "@/types/football-data";
import { mapFootballDataMatch } from "@/lib/football-data";
import { sortMatchesByStartTime } from "@/lib/utils";

export async function GET() {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  const competition = process.env.FOOTBALL_DATA_COMPETITION ?? "WC";

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "缺少 FOOTBALL_DATA_API_KEY。请在 .env.local 中配置后重启服务。",
        matches: [],
      },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://api.football-data.org/v4/competitions/${competition}/matches`,
    {
      headers: {
        "X-Auth-Token": token,
      },
      next: {
        revalidate: 60 * 30,
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `Football Data API 返回错误：${response.status}`,
        matches: [],
      },
      { status: response.status },
    );
  }

  const data = (await response.json()) as FootballDataMatchesResponse;

  return NextResponse.json({
    ok: true,
    source: "football-data.org",
    competition: data.competition,
    syncedAt: new Date().toISOString(),
    matches: sortMatchesByStartTime(data.matches.map(mapFootballDataMatch)),
  });
}
