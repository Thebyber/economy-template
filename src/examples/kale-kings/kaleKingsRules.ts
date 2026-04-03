/**
 * Kale Kings — economy constants and reward rolls (see docs/GAME_SPEC.md).
 */

export const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export const RUN_COST_KALE = {
  meadow: 1,
  forest: 5,
  mystio: 25,
} as const;

export type RunZone = keyof typeof RUN_COST_KALE;

export const UNLOCK_FOREST_MAGICAL = 25;
export const UNLOCK_MYSTIO = { magical: 150, golden: 50 } as const;
export const GIANT_KALE_GOLDEN_COST = 1;

export function rollInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Meadow: 1–5 Magical Kale */
export function rollMeadowLoot(): { magical: number; golden: number } {
  return { magical: rollInt(1, 5), golden: 0 };
}

/** Forest: 1–10 Magical, 0–1 Golden */
export function rollForestLoot(): { magical: number; golden: number } {
  return { magical: rollInt(1, 10), golden: rollInt(0, 1) };
}

/** Mystio: 0–3 Golden */
export function rollMystioLoot(): { magical: number; golden: number } {
  return { magical: 0, golden: rollInt(0, 3) };
}

export function rollLootForZone(zone: RunZone): { magical: number; golden: number } {
  if (zone === "meadow") return rollMeadowLoot();
  if (zone === "forest") return rollForestLoot();
  return rollMystioLoot();
}

/** Whole periods elapsed; each Giant Kale adds 1 Kale per period. */
export function passiveKaleAccrued(
  lastPassiveClaimAt: number,
  giantKaleCount: number,
  now = Date.now(),
): { periods: number; kale: number } {
  if (lastPassiveClaimAt <= 0 || giantKaleCount <= 0) {
    return { periods: 0, kale: 0 };
  }
  const elapsed = now - lastPassiveClaimAt;
  const periods = Math.floor(elapsed / EIGHT_HOURS_MS);
  return { periods, kale: periods * giantKaleCount };
}

export function nextPassiveClaimAfterCollect(
  lastPassiveClaimAt: number,
  periods: number,
): number {
  return lastPassiveClaimAt + periods * EIGHT_HOURS_MS;
}
