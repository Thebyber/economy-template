import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { EnemyType } from "./Enemies";
import type { DeepDungeonRunResult } from "./deepDungeonLifecycle";
import { CRYSTAL_SCENE_KEY_TO_ITEM_ID } from "./deepDungeonItemIds";
import { DUNGEON_POINTS } from "../DeepDungeonConstants";

/**
 * Mutable run state tracked on the React side for GAMEOVER payload assembly.
 * Uses refs to avoid re-renders — the only React state that triggers UI
 * updates comes via the phaserApi.onStatsChanged callback.
 */
interface RunAccumulator {
  deepCoins: number;
  crystals: Record<string, number>;        // item-ID keys, for GAMEOVER payload
  crystalsBySceneKey: Record<string, number>; // scene-key keys, for inventory display
  levelEnemies: Record<string, number>;    // per-level enemy kills, resets on level change
  levelCrystals: Record<string, number>;   // per-level crystal mines (scene keys), resets on level change
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
    crystalsBySceneKey: {},
    levelEnemies: {},
    levelCrystals: {},
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
  /** Per-level enemy kills — resets when the player advances to the next map. Used by codex. */
  enemies: Record<string, number>;
  /** Per-level crystal mines (scene keys) — resets on level change. Used by codex. */
  levelCrystals: Record<string, number>;
  /** Cumulative crystals by scene key across the whole run. Used by inventory. */
  crystals: Record<string, number>;
  /** Cumulative enemy kills by type across the whole run. Used by inventory. */
  totalEnemiesByType: Record<string, number>;
  currentLevel: number;
  deepCoins: number;
}

interface DeepDungeonRunContextValue {
  resetRun: () => void;
  addCrystal: (crystalKey: string) => void;
  addEnemyKill: (enemyType: EnemyType) => void;
  addDeepCoin: () => void;
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
    const itemId = CRYSTAL_SCENE_KEY_TO_ITEM_ID[crystalKey] ?? crystalKey;
    acc.current.crystals[itemId] = (acc.current.crystals[itemId] ?? 0) + 1;
    acc.current.crystalsBySceneKey[crystalKey] = (acc.current.crystalsBySceneKey[crystalKey] ?? 0) + 1;
    acc.current.levelCrystals[crystalKey] = (acc.current.levelCrystals[crystalKey] ?? 0) + 1;
    acc.current.crystalsMined += 1;
    acc.current.score += DUNGEON_POINTS.CRYSTALS[crystalKey as keyof typeof DUNGEON_POINTS.CRYSTALS] ?? 10;
    acc.current.playerXp += 5;
  }, []);

  const addEnemyKill = useCallback((enemyType: EnemyType) => {
    acc.current.enemiesKilled += 1;
    acc.current.score += DUNGEON_POINTS.ENEMIES[enemyType as keyof typeof DUNGEON_POINTS.ENEMIES] ?? 20;
    acc.current.playerXp += 10;
    const typeKey = enemyType.toLowerCase();
    acc.current.levelEnemies[typeKey] = (acc.current.levelEnemies[typeKey] ?? 0) + 1;
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

  const addDeepCoin = useCallback(() => {
    acc.current.deepCoins += 1;
  }, []);

  const setLevel = useCallback((level: number) => {
    acc.current.dungeonLevelReached = level;
    acc.current.score += level * 50;
    acc.current.levelEnemies = {};
    acc.current.levelCrystals = {};
  }, []);

  const getProgress = useCallback((): RunProgress => {
    const a = acc.current;
    return {
      enemies: { ...a.levelEnemies },
      levelCrystals: { ...a.levelCrystals },
      crystals: { ...a.crystalsBySceneKey },
      totalEnemiesByType: {
        slime:         a.slimesKilled,
        skeleton:      a.skeletonsKilled,
        knight:        a.knightsKilled,
        frankenstein:  a.frankensteinsKilled,
        devil:         a.devilsKilled,
      },
      currentLevel: a.dungeonLevelReached,
      deepCoins: a.deepCoins,
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
      value={{ resetRun, addCrystal, addEnemyKill, addDeepCoin, setLevel, buildResult, getProgress }}
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
