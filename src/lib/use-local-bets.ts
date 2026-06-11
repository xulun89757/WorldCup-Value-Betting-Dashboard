"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bet } from "@/types/bet";

const storageKey = "worldcup-dashboard:bets:v1";

export function useLocalBets(initialBets: Bet[]) {
  const [bets, setBets] = useState<Bet[]>(initialBets);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);

    if (raw) {
      try {
        setBets(JSON.parse(raw) as Bet[]);
      } catch {
        setBets(initialBets);
      }
    }

    setIsLoaded(true);
  }, [initialBets]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(bets));
    }
  }, [bets, isLoaded]);

  return useMemo(
    () => ({
      bets,
      setBets,
      resetBets: () => setBets(initialBets),
      isLoaded,
    }),
    [bets, initialBets, isLoaded],
  );
}
