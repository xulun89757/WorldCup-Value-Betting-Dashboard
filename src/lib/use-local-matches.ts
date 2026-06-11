"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "@/types/match";
import { sortMatchesByStartTime } from "./utils";

const storageKey = "worldcup-dashboard:api-matches:v1";

type StoredMatches = {
  source: "football-data.org";
  syncedAt: string;
  matches: Match[];
};

function parseStoredMatches(raw: string): StoredMatches | null {
  const parsed = JSON.parse(raw) as Match[] | StoredMatches;

  if (Array.isArray(parsed)) {
    return {
      source: "football-data.org",
      syncedAt: "",
      matches: parsed,
    };
  }

  if (Array.isArray(parsed.matches)) {
    return parsed;
  }

  return null;
}

export function useLocalMatches(initialMatches: Match[]) {
  const [matches, setMatches] = useState<Match[]>(
    sortMatchesByStartTime(initialMatches),
  );
  const [source, setSource] = useState<"mock" | "api">("mock");
  const [syncedAt, setSyncedAt] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (raw) {
      try {
        const parsed = parseStoredMatches(raw);
        if (parsed && parsed.matches.length > 0) {
          setMatches(sortMatchesByStartTime(parsed.matches));
          setSource("api");
          setSyncedAt(parsed.syncedAt);
        }
      } catch {
        setMatches(sortMatchesByStartTime(initialMatches));
        setSource("mock");
        setSyncedAt("");
      }
    }

    setIsLoaded(true);
  }, [initialMatches]);

  return useMemo(
    () => ({
      matches,
      source,
      syncedAt,
      isLoaded,
      saveApiMatches: (nextMatches: Match[], nextSyncedAt?: string) => {
        const value: StoredMatches = {
          source: "football-data.org",
          syncedAt: nextSyncedAt ?? new Date().toISOString(),
          matches: sortMatchesByStartTime(nextMatches),
        };
        window.localStorage.setItem(storageKey, JSON.stringify(value));
        setMatches(sortMatchesByStartTime(nextMatches));
        setSource("api");
        setSyncedAt(value.syncedAt);
      },
      resetMatches: () => {
        window.localStorage.removeItem(storageKey);
        setMatches(sortMatchesByStartTime(initialMatches));
        setSource("mock");
        setSyncedAt("");
      },
    }),
    [matches, source, syncedAt, isLoaded, initialMatches],
  );
}
