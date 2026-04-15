import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { EnemyType } from "./Enemies";
import type { DeepDungeonRunResult } from "./deepDungeonLifecycle";

/**
 * Mutable run state tracked on the React side for GAMEOVER payload assembly.
 * Uses refs to avoid re-renders — the only React state that triggers UI
 * updates comes via the phaserApi.onStatsChanged callback.
 */
interface RunAccumulator {
  deepCoins: number;
  crystals: Record<string, number>;
  score: number;
  playerXp: number;
  dungeonLevelReached: number;
  enemiesKilled: number;
  slimesKilled: number;
  skeletonsKilled: number;
  knightsKilled: number;
  frankensteinsKilled: number;
  devilsKilled: number;
  crystalsMined: number;
}

function makeEmptyAccumulator(): RunAccumulator {
  return {
    deepCoins: 0,
    crystals: {},
    score: 0,
    playerXp: 0,
    dungeonLevelReached: 1,
    enemiesKilled: 0,
    slimesKilled: 0,
    skeletonsKilled: 0,
    knightsKilled: 0,
    frankensteinsKilled: 0,
    devilsKilled: 0,
    crystalsMined: 0,
  };
}

export interface RunProgress {
  enemies: Record<string, number>;
  crystals: Record<string, number>;
  currentLevel: number;
}

interface DeepDungeonRunContextValue {
  resetRun: () => void;
  addCrystal: (crystalKey: string) => void;
  addEnemyKill: (enemyType: EnemyType) => void;
  setLevel: (level: number) => void;
  buildResult: () => DeepDungeonRunResult;
  getProgress: () => RunProgress;
}

const DeepDungeonRunContext = createContext<DeepDungeonRunContextValue | null>(null);

export const DeepDungeonRunProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const acc = useRef<RunAccumulator>(makeEmptyAccumulator());

  const resetRun = useCallback(() => {
    acc.current = makeEmptyAccumulator();
  }, []);

  const addCrystal = useCallback((crystalKey: string) => {
    acc.current.crystals[crystalKey] = (acc.current.crystals[crystalKey] ?? 0) + 1;
    acc.current.crystalsMined += 1;
    acc.current.deepCoins += 1; // each crystal also yields 1 deep coin
    acc.current.score += 10;
    acc.current.playerXp += 5;
  }, []);

  const addEnemyKill = useCallback((enemyType: EnemyType) => {
    acc.current.enemiesKilled += 1;
    acc.current.score += 20;
    acc.current.playerXp += 10;
    acc.current.deepCoins += 1;
    switch (enemyType) {
      case "SLIME":
        acc.current.slimesKilled += 1;
        break;
      case "SKELETON":
        acc.current.skeletonsKilled += 1;
        break;
      case "KNIGHT":
        acc.current.knightsKilled += 1;
        break;
      case "FRANKENSTEIN":
        acc.current.frankensteinsKilled += 1;
        break;
      case "DEVIL":
        acc.current.devilsKilled += 1;
        break;
    }
  }, []);

  const setLevel = useCallback((level: number) => {
    acc.current.dungeonLevelReached = level;
    acc.current.score += level * 50;
  }, []);

  const getProgress = useCallback((): RunProgress => {
    const a = acc.current;
    return {
      enemies: {
        skeleton: a.skeletonsKilled,
        slime: a.slimesKilled,
        knight: a.knightsKilled,
        frankenstein: a.frankensteinsKilled,
        devil: a.devilsKilled,
      },
      crystals: { ...a.crystals },
      currentLevel: a.dungeonLevelReached,
    };
  }, []);

  const buildResult = useCallback((): DeepDungeonRunResult => {
    const a = acc.current;
    return {
      deepCoins: a.deepCoins,
      crystals: { ...a.crystals },
      score: a.score,
      playerXp: a.playerXp,
      stats: {
        dungeonLevelReached: a.dungeonLevelReached,
        enemiesKilled: a.enemiesKilled,
        slimesKilled: a.slimesKilled,
        skeletonsKilled: a.skeletonsKilled,
        knightsKilled: a.knightsKilled,
        frankensteinsKilled: a.frankensteinsKilled,
        devilsKilled: a.devilsKilled,
        crystalsMined: a.crystalsMined,
      },
    };
  }, []);

  return (
    <DeepDungeonRunContext.Provider
      value={{ resetRun, addCrystal, addEnemyKill, setLevel, buildResult, getProgress }}
    >
      {children}
    </DeepDungeonRunContext.Provider>
  );
};

export function useDeepDungeonRun(): DeepDungeonRunContextValue {
  const ctx = useContext(DeepDungeonRunContext);
  if (!ctx) throw new Error("useDeepDungeonRun must be inside DeepDungeonRunProvider");
  return ctx;
}
