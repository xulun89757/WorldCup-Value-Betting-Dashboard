"use client";

import { useEffect, useMemo, useState } from "react";

type StoredAiAnalysis = {
  text: string;
  status: string;
  generatedAt: string;
};

const storagePrefix = "worldcup-dashboard:ai-analysis:";

export function useAiAnalysisCache(matchId: string) {
  const storageKey = `${storagePrefix}${matchId}`;
  const [cached, setCached] = useState<StoredAiAnalysis | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);

      if (raw) {
        setCached(JSON.parse(raw) as StoredAiAnalysis);
      }
    } catch {
      setCached(null);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  return useMemo(
    () => ({
      cached,
      isLoaded,
      save: (text: string, status: string) => {
        const value: StoredAiAnalysis = {
          text,
          status,
          generatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(storageKey, JSON.stringify(value));
        setCached(value);
      },
      clear: () => {
        window.localStorage.removeItem(storageKey);
        setCached(null);
      },
    }),
    [cached, isLoaded, storageKey],
  );
}
