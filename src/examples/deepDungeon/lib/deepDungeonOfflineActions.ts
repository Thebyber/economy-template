/**
 * Offline action stubs for Deep Dungeon (no Minigames API in local dev).
 *
 * IDs match the economy dashboard:
 *   "1"  = attempts
 *   "0"  = deep_coin
 *   "2"…"21" = crystals (pink/white/blue/prismora, tiers 1-5)
 *   "30" = score (best)
 *   "22"…"29" = lifetime stats
 *   "32"…"91" = trophies
 */
export const DEEP_DUNGEON_OFFLINE_ACTIONS: Record<string, unknown> = {
  /** Burn 1 attempt → mint ACTIVE_RUN (daily cap = 3 free). */
  START_GAME: {
    showInShop: false,
    mint: { ACTIVE_RUN: { amount: 1 } },
    burn: { "1": { amount: 1 } },
    dailyCap: 3,
  },

  /**
   * End of run: burn ACTIVE_RUN, mint rewards.
   * The client sends `amounts` with the actual values earned this run.
   * Ranged rules allow 0–max for each reward.
   */
  GAMEOVER: {
    showInShop: false,
    burn: { ACTIVE_RUN: { amount: 1 } },
    mint: {
      // deep_coin
      "0": { min: 0, max: 500, dailyCap: 1000 },
      // crystals — pink
      "2": { min: 0, max: 20, dailyCap: 100 },
      "3": { min: 0, max: 20, dailyCap: 100 },
      "4": { min: 0, max: 20, dailyCap: 100 },
      "5": { min: 0, max: 20, dailyCap: 100 },
      "6": { min: 0, max: 20, dailyCap: 100 },
      // crystals — white
      "7": { min: 0, max: 20, dailyCap: 100 },
      "8": { min: 0, max: 20, dailyCap: 100 },
      "9": { min: 0, max: 20, dailyCap: 100 },
      "10": { min: 0, max: 20, dailyCap: 100 },
      "11": { min: 0, max: 20, dailyCap: 100 },
      // crystals — blue
      "12": { min: 0, max: 20, dailyCap: 100 },
      "13": { min: 0, max: 20, dailyCap: 100 },
      "14": { min: 0, max: 20, dailyCap: 100 },
      "15": { min: 0, max: 20, dailyCap: 100 },
      "16": { min: 0, max: 20, dailyCap: 100 },
      // crystals — prismora
      "17": { min: 0, max: 20, dailyCap: 100 },
      "18": { min: 0, max: 20, dailyCap: 100 },
      "19": { min: 0, max: 20, dailyCap: 100 },
      "20": { min: 0, max: 20, dailyCap: 100 },
      "21": { min: 0, max: 20, dailyCap: 100 },
      // lifetime stats (additive, server accumulates)
      "22": { min: 0, max: 20, dailyCap: 1000 }, // dungeon_level_reached
      "23": { min: 0, max: 200, dailyCap: 5000 }, // enemies_killed
      "24": { min: 0, max: 200, dailyCap: 5000 }, // slimes_killed
      "25": { min: 0, max: 200, dailyCap: 5000 }, // skeletons_killed
      "26": { min: 0, max: 200, dailyCap: 5000 }, // knights_killed
      "27": { min: 0, max: 200, dailyCap: 5000 }, // frankensteins_killed
      "28": { min: 0, max: 200, dailyCap: 5000 }, // devils_killed
      "29": { min: 0, max: 200, dailyCap: 5000 }, // crystals_mined
      // score (best — server keeps max, not sum)
      "30": { min: 0, max: 999999, dailyCap: 999999 },
      // player_xp
      "31": { min: 0, max: 1000, dailyCap: 10000 },
    },
  },

  /** Buy extra attempts with FLOWER (cost configured on dashboard). */
  BUY_ATTEMPTS: {
    showInShop: true,
    mint: { "1": { amount: 3 } },
  },
};
