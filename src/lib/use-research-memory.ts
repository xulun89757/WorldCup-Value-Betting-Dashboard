"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ResearchMemory,
  ResearchRecord,
  TeamProfile,
} from "@/types/research";

const profilesStorageKey = "worldcup-dashboard:team-profiles:v1";
const recordsStorageKey = "worldcup-dashboard:research-records:v1";

function normalizeTeamName(value: string) {
  return value.trim().toLowerCase();
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function useResearchMemory() {
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>([]);
  const [researchRecords, setResearchRecords] = useState<ResearchRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTeamProfiles(readJsonArray<TeamProfile>(profilesStorageKey));
    setResearchRecords(readJsonArray<ResearchRecord>(recordsStorageKey));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(
        profilesStorageKey,
        JSON.stringify(teamProfiles),
      );
    }
  }, [isLoaded, teamProfiles]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(
        recordsStorageKey,
        JSON.stringify(researchRecords),
      );
    }
  }, [isLoaded, researchRecords]);

  function upsertTeamProfile(input: Omit<TeamProfile, "id" | "updatedAt">) {
    const teamName = input.teamName.trim();
    if (!teamName) {
      return;
    }

    setTeamProfiles((current) => {
      const existing = current.find(
        (profile) =>
          normalizeTeamName(profile.teamName) === normalizeTeamName(teamName),
      );
      const nextProfile: TeamProfile = {
        id: existing?.id ?? createId(),
        ...input,
        teamName,
        updatedAt: new Date().toISOString(),
      };
      const others = current.filter((profile) => profile.id !== nextProfile.id);

      return [...others, nextProfile].sort((a, b) =>
        a.teamName.localeCompare(b.teamName),
      );
    });
  }

  function addResearchRecord(input: Omit<ResearchRecord, "id" | "createdAt">) {
    const nextRecord: ResearchRecord = {
      id: createId(),
      createdAt: new Date().toISOString(),
      ...input,
    };

    setResearchRecords((current) => [nextRecord, ...current]);
  }

  function clearResearchRecords() {
    setResearchRecords([]);
  }

  function deleteTeamProfile(id: string) {
    setTeamProfiles((current) => current.filter((profile) => profile.id !== id));
  }

  function getTeamProfile(teamName: string) {
    return teamProfiles.find(
      (profile) =>
        normalizeTeamName(profile.teamName) === normalizeTeamName(teamName),
    );
  }

  const memory: ResearchMemory = useMemo(
    () => ({
      teamProfiles,
      researchRecords,
    }),
    [researchRecords, teamProfiles],
  );

  return {
    teamProfiles,
    researchRecords,
    memory,
    isLoaded,
    upsertTeamProfile,
    addResearchRecord,
    clearResearchRecords,
    deleteTeamProfile,
    getTeamProfile,
  };
}
