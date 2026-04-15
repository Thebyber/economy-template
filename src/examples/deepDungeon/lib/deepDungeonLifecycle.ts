/**
 * Pure functions that apply optimistic economy mutations for Deep Dungeon.
 * These mirror what the server will do — used by dispatchAction() before
 * the POST /action response arrives.
 *
 * Item ID reference: deepDungeonItemIds.ts
 */
import type { MinigameSessionResponse } from "lib/portal";
import { cloneMinigameSnapshot } from "lib/portal/runtimeHelpers";
import { DD_ITEM, DD_ACTIVE_RUN_KEY } from "./deepDungeonItemIds";

type Economy = MinigameSessionResponse["playerEconomy"];
type ApplyResult =
  | { ok: true; playerEconomy: Economy }
  | { ok: false; error: string };

// ─── START_GAME ──────────────────────────────────────────────────────────────

/**
 * Burn 1 attempt → mint ACTIVE_RUN.
 * Called when the player presses "Play" and has attempts remaining.
 */
export function applyDeepDungeonStartGame(economy: Economy): ApplyResult {
  const attempts = economy.balances[DD_ITEM.ATTEMPTS] ?? 0;
  if (attempts < 1) {
    return { ok: false, error: "no_attempts" };
  }
  const next = cloneMinigameSnapshot(economy);
  next.balances[DD_ITEM.ATTEMPTS] = attempts - 1;
  next.balances[DD_ACTIVE_RUN_KEY] = (next.balances[DD_ACTIVE_RUN_KEY] ?? 0) + 1;
  return { ok: true, playerEconomy: next };
}

// ─── GAMEOVER ────────────────────────────────────────────────────────────────

export interface DeepDungeonRunResult {
  deepCoins: number;
  crystals: Record<string, number>; // keyed by DD_ITEM crystal id ("2"…"21")
  score: number;
  playerXp: number;
  stats: {
    dungeonLevelReached: number;
    enemiesKilled: number;
    slimesKilled: number;
    skeletonsKilled: number;
    knightsKilled: number;
    frankensteinsKilled: number;
    devilsKilled: number;
    crystalsMined: number;
  };
}

/**
 * Burn ACTIVE_RUN, add earned rewards to balances.
 * Score is stored as best (max), not cumulative — handled server-side;
 * optimistically we just set it if higher than current.
 */
export function applyDeepDungeonGameOver(
  economy: Economy,
  result: DeepDungeonRunResult,
): ApplyResult {
  const next = cloneMinigameSnapshot(economy);

  // burn run token
  const activeRun = next.balances[DD_ACTIVE_RUN_KEY] ?? 0;
  next.balances[DD_ACTIVE_RUN_KEY] = Math.max(0, activeRun - 1);

  // deep_coin
  next.balances[DD_ITEM.DEEP_COIN] =
    (next.balances[DD_ITEM.DEEP_COIN] ?? 0) + result.deepCoins;

  // crystals
  for (const [id, amount] of Object.entries(result.crystals)) {
    if (amount > 0) {
      next.balances[id] = (next.balances[id] ?? 0) + amount;
    }
  }

  // score (best)
  const currentScore = next.balances[DD_ITEM.SCORE] ?? 0;
  if (result.score > currentScore) {
    next.balances[DD_ITEM.SCORE] = result.score;
  }

  // player xp (cumulative)
  next.balances[DD_ITEM.PLAYER_XP] =
    (next.balances[DD_ITEM.PLAYER_XP] ?? 0) + result.playerXp;

  // lifetime stats (cumulative)
  const s = result.stats;
  next.balances[DD_ITEM.DUNGEON_LEVEL_REACHED] =
    (next.balances[DD_ITEM.DUNGEON_LEVEL_REACHED] ?? 0) + s.dungeonLevelReached;
  next.balances[DD_ITEM.ENEMIES_KILLED] =
    (next.balances[DD_ITEM.ENEMIES_KILLED] ?? 0) + s.enemiesKilled;
  next.balances[DD_ITEM.SLIMES_KILLED] =
    (next.balances[DD_ITEM.SLIMES_KILLED] ?? 0) + s.slimesKilled;
  next.balances[DD_ITEM.SKELETONS_KILLED] =
    (next.balances[DD_ITEM.SKELETONS_KILLED] ?? 0) + s.skeletonsKilled;
  next.balances[DD_ITEM.KNIGHTS_KILLED] =
    (next.balances[DD_ITEM.KNIGHTS_KILLED] ?? 0) + s.knightsKilled;
  next.balances[DD_ITEM.FRANKENSTEINS_KILLED] =
    (next.balances[DD_ITEM.FRANKENSTEINS_KILLED] ?? 0) + s.frankensteinsKilled;
  next.balances[DD_ITEM.DEVILS_KILLED] =
    (next.balances[DD_ITEM.DEVILS_KILLED] ?? 0) + s.devilsKilled;
  next.balances[DD_ITEM.CRYSTALS_MINED] =
    (next.balances[DD_ITEM.CRYSTALS_MINED] ?? 0) + s.crystalsMined;

  return { ok: true, playerEconomy: next };
}

// ─── Trofeos ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the player already owns a specific trophy.
 * Trophies are permanent (balance >= 1 means owned).
 */
export function hasTrophy(economy: Economy, trophyItemId: string): boolean {
  return (economy.balances[trophyItemId] ?? 0) >= 1;
}

// ─── Stats helpers ───────────────────────────────────────────────────────────

export interface DeepDungeonPlayerStats {
  energy: number;
  attack: number;
  defense: number;
  criticalChance: number;
  startingPickaxes: number;
}

const BASE_STATS: DeepDungeonPlayerStats = {
  energy: 100,
  attack: 5,
  defense: 2,
  criticalChance: 5,
  startingPickaxes: 1,
};

/**
 * Calculates combat stats for the current run by summing trophy boosts.
 * Call this once before START_GAME to pass stats into the Phaser scene.
 */
export function calcPlayerStats(economy: Economy): DeepDungeonPlayerStats {
  const b = economy.balances;
  const has = (id: string) => (b[id] ?? 0) >= 1;

  let energy = BASE_STATS.energy;
  let attack = BASE_STATS.attack;
  let defense = BASE_STATS.defense;
  let crit = BASE_STATS.criticalChance;
  let pickaxes = BASE_STATS.startingPickaxes;

  // ── trophy_enemies ────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_ENEMIES_BRONZE)) energy += 5;
  if (has(DD_ITEM.TROPHY_ENEMIES_SILVER)) attack += 1;
  if (has(DD_ITEM.TROPHY_ENEMIES_GOLD)) defense += 1;
  if (has(DD_ITEM.TROPHY_ENEMIES_EMERALD)) crit += 2;
  if (has(DD_ITEM.TROPHY_ENEMIES_DIAMOND)) { energy += 5; attack += 1; defense += 1; crit += 2; }

  // ── trophy_slime ──────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_SLIME_BRONZE)) energy += 5;
  if (has(DD_ITEM.TROPHY_SLIME_SILVER)) energy += 5;
  if (has(DD_ITEM.TROPHY_SLIME_GOLD)) energy += 5;
  if (has(DD_ITEM.TROPHY_SLIME_EMERALD)) energy += 5;
  if (has(DD_ITEM.TROPHY_SLIME_DIAMOND)) energy += 10;

  // ── trophy_skeleton ───────────────────────────────────────
  if (has(DD_ITEM.TROPHY_SKELETON_BRONZE)) attack += 1;
  if (has(DD_ITEM.TROPHY_SKELETON_SILVER)) attack += 1;
  if (has(DD_ITEM.TROPHY_SKELETON_GOLD)) attack += 1;
  if (has(DD_ITEM.TROPHY_SKELETON_EMERALD)) attack += 1;
  if (has(DD_ITEM.TROPHY_SKELETON_DIAMOND)) attack += 2;

  // ── trophy_knight ─────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_KNIGHT_BRONZE)) defense += 1;
  if (has(DD_ITEM.TROPHY_KNIGHT_SILVER)) defense += 1;
  if (has(DD_ITEM.TROPHY_KNIGHT_GOLD)) defense += 1;
  if (has(DD_ITEM.TROPHY_KNIGHT_EMERALD)) defense += 1;
  if (has(DD_ITEM.TROPHY_KNIGHT_DIAMOND)) defense += 2;

  // ── trophy_frankenstein ───────────────────────────────────
  if (has(DD_ITEM.TROPHY_FRANKENSTEIN_BRONZE)) attack += 1;
  if (has(DD_ITEM.TROPHY_FRANKENSTEIN_SILVER)) defense += 1;
  if (has(DD_ITEM.TROPHY_FRANKENSTEIN_GOLD)) attack += 1;
  if (has(DD_ITEM.TROPHY_FRANKENSTEIN_EMERALD)) defense += 1;
  if (has(DD_ITEM.TROPHY_FRANKENSTEIN_DIAMOND)) { attack += 1; defense += 1; }

  // ── trophy_devil ──────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_DEVIL_BRONZE)) crit += 2;
  if (has(DD_ITEM.TROPHY_DEVIL_SILVER)) crit += 2;
  if (has(DD_ITEM.TROPHY_DEVIL_GOLD)) crit += 3;
  if (has(DD_ITEM.TROPHY_DEVIL_EMERALD)) crit += 3;
  if (has(DD_ITEM.TROPHY_DEVIL_DIAMOND)) crit += 5;

  // ── trophy_crystal ────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_CRYSTAL_BRONZE)) pickaxes += 1;
  if (has(DD_ITEM.TROPHY_CRYSTAL_SILVER)) pickaxes += 1;
  if (has(DD_ITEM.TROPHY_CRYSTAL_GOLD)) pickaxes += 1;
  if (has(DD_ITEM.TROPHY_CRYSTAL_EMERALD)) pickaxes += 1;
  if (has(DD_ITEM.TROPHY_CRYSTAL_DIAMOND)) pickaxes += 2;

  // ── trophy_lightning ──────────────────────────────────────
  if (has(DD_ITEM.TROPHY_LIGHTNING_BRONZE)) energy += 5;
  if (has(DD_ITEM.TROPHY_LIGHTNING_SILVER)) energy += 5;
  if (has(DD_ITEM.TROPHY_LIGHTNING_GOLD)) energy += 5;
  if (has(DD_ITEM.TROPHY_LIGHTNING_EMERALD)) energy += 5;
  if (has(DD_ITEM.TROPHY_LIGHTNING_DIAMOND)) energy += 10;

  // ── trophy_sword ──────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_SWORD_BRONZE)) attack += 1;
  if (has(DD_ITEM.TROPHY_SWORD_SILVER)) attack += 1;
  if (has(DD_ITEM.TROPHY_SWORD_GOLD)) attack += 1;
  if (has(DD_ITEM.TROPHY_SWORD_EMERALD)) attack += 1;
  if (has(DD_ITEM.TROPHY_SWORD_DIAMOND)) attack += 2;

  // ── trophy_shield ─────────────────────────────────────────
  if (has(DD_ITEM.TROPHY_SHIELD_BRONZE)) defense += 1;
  if (has(DD_ITEM.TROPHY_SHIELD_SILVER)) defense += 1;
  if (has(DD_ITEM.TROPHY_SHIELD_GOLD)) defense += 1;
  if (has(DD_ITEM.TROPHY_SHIELD_EMERALD)) defense += 1;
  if (has(DD_ITEM.TROPHY_SHIELD_DIAMOND)) defense += 2;

  // ── trophy_critical ───────────────────────────────────────
  if (has(DD_ITEM.TROPHY_CRITICAL_BRONZE)) crit += 2;
  if (has(DD_ITEM.TROPHY_CRITICAL_SILVER)) crit += 2;
  if (has(DD_ITEM.TROPHY_CRITICAL_GOLD)) crit += 2;
  if (has(DD_ITEM.TROPHY_CRITICAL_EMERALD)) crit += 2;
  if (has(DD_ITEM.TROPHY_CRITICAL_DIAMOND)) crit += 7;

  // ── trophy_deepcoin ───────────────────────────────────────
  if (has(DD_ITEM.TROPHY_DEEPCOIN_BRONZE)) { energy += 5; attack += 1; defense += 1; crit += 2; }
  if (has(DD_ITEM.TROPHY_DEEPCOIN_SILVER)) { energy += 5; attack += 1; defense += 1; crit += 2; }
  if (has(DD_ITEM.TROPHY_DEEPCOIN_GOLD)) { energy += 5; attack += 1; defense += 1; crit += 2; }
  if (has(DD_ITEM.TROPHY_DEEPCOIN_EMERALD)) { energy += 5; attack += 1; defense += 1; crit += 2; }
  if (has(DD_ITEM.TROPHY_DEEPCOIN_DIAMOND)) { energy += 5; attack += 1; defense += 1; crit += 2; }

  return { energy, attack, defense, criticalChance: crit, startingPickaxes: pickaxes };
}
