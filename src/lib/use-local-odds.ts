"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchOdds, StoredOdds } from "@/types/odds";

const storageKey = "worldcup-dashboard:api-odds:v1";
const emptyInitialOdds: MatchOdds[] = [];

function parseStoredOdds(raw: string): StoredOdds | null {
  const parsed = JSON.parse(raw) as MatchOdds[] | StoredOdds;

  if (Array.isArray(parsed)) {
    return {
      source: "api",
      syncedAt: null,
      odds: parsed,
    };
  }

  if (!Array.isArray(parsed.odds)) {
    return null;
  }

  return parsed;
}

export function useLocalOdds(initialOdds: MatchOdds[] = emptyInitialOdds) {
  const [odds, setOdds] = useState<MatchOdds[]>(initialOdds);
  const [source, setSource] = useState<StoredOdds["source"]>(
    initialOdds.length > 0 ? "api" : "mock",
  );
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      setIsLoaded(true);
      return;
    }

    try {
      const parsed = parseStoredOdds(raw);

      if (parsed) {
        setOdds(parsed.odds);
        setSource(parsed.source);
        setSyncedAt(parsed.syncedAt);
      }
    } catch {
      setOdds(initialOdds);
      setSource(initialOdds.length > 0 ? "api" : "mock");
      setSyncedAt(null);
    } finally {
      setIsLoaded(true);
    }
  }, [initialOdds]);

  return useMemo(
    () => ({
      odds,
      source,
      syncedAt,
      isLoaded,
      saveApiOdds: (nextOdds: MatchOdds[], nextSyncedAt?: string) => {
        const value: StoredOdds = {
          source: "api",
          syncedAt: nextSyncedAt ?? new Date().toISOString(),
          odds: nextOdds,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(value));
        setOdds(nextOdds);
        setSource("api");
        setSyncedAt(value.syncedAt);
      },
      resetOdds: () => {
        window.localStorage.removeItem(storageKey);
        setOdds(initialOdds);
        setSource(initialOdds.length > 0 ? "api" : "mock");
        setSyncedAt(null);
      },
    }),
    [odds, source, syncedAt, isLoaded, initialOdds],
  );
}
