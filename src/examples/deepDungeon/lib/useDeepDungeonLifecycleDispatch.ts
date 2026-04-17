import { useCallback } from "react";
import { useMinigameSession, submitScore } from "lib/portal";
import { useDeepDungeonActionIds } from "./useDeepDungeonActionIds";
import {
  applyDeepDungeonStartGame,
  applyDeepDungeonGameOver,
  applyDeepDungeonFreeAttempts,
  type DeepDungeonRunResult,
} from "./deepDungeonLifecycle";
import { calcPlayerStats, type DeepDungeonPlayerStats } from "./deepDungeonLifecycle";
import { DD_ITEM } from "./deepDungeonItemIds";

export function useDeepDungeonLifecycleDispatch() {
  const { commitLocalPlayerEconomySync, playerEconomy, jwt } = useMinigameSession();
  const actionIds = useDeepDungeonActionIds();

  /** Burns 1 attempt, mints ACTIVE_RUN. Returns player stats for the run (trophy boosts). */
  const startGame = useCallback((): DeepDungeonPlayerStats | null => {
    const stats = calcPlayerStats(playerEconomy);
    const applied = applyDeepDungeonStartGame(playerEconomy);
    if (!applied.ok) {
      return null;
    }
    const ok = commitLocalPlayerEconomySync({
      action: actionIds.startGame,
      nextPlayerEconomy: applied.playerEconomy,
    });
    return ok ? stats : null;
  }, [actionIds.startGame, commitLocalPlayerEconomySync, playerEconomy]);

  /** Burns ACTIVE_RUN, mints earned rewards. Call after the player dies. */
  const endRun = useCallback(
    (result: DeepDungeonRunResult): boolean => {
      const applied = applyDeepDungeonGameOver(playerEconomy, result);
      if (!applied.ok) {
        return false;
      }
      // Clamp amounts to non-negative integers only (server enforces its own limits).
      const nn = (value: number) => Math.max(0, Math.floor(value));
      const cx = (key: string) => nn(result.crystals?.[key] || 0);
      // dungeonLevelReached: send only the delta so additive server yields a "best" result
      const currentBestLevel = playerEconomy.balances[DD_ITEM.DUNGEON_LEVEL_REACHED] ?? 0;
      const levelDelta = Math.max(0, result.stats.dungeonLevelReached - currentBestLevel);
      const amounts: Record<string, number> = {
        [DD_ITEM.DEEP_COIN]:             nn(result.deepCoins),
        [DD_ITEM.PINK_CRYSTAL_1]:        cx(DD_ITEM.PINK_CRYSTAL_1),
        [DD_ITEM.PINK_CRYSTAL_2]:        cx(DD_ITEM.PINK_CRYSTAL_2),
        [DD_ITEM.PINK_CRYSTAL_3]:        cx(DD_ITEM.PINK_CRYSTAL_3),
        [DD_ITEM.PINK_CRYSTAL_4]:        cx(DD_ITEM.PINK_CRYSTAL_4),
        [DD_ITEM.PINK_CRYSTAL_5]:        cx(DD_ITEM.PINK_CRYSTAL_5),
        [DD_ITEM.WHITE_CRYSTAL_1]:       cx(DD_ITEM.WHITE_CRYSTAL_1),
        [DD_ITEM.WHITE_CRYSTAL_2]:       cx(DD_ITEM.WHITE_CRYSTAL_2),
        [DD_ITEM.WHITE_CRYSTAL_3]:       cx(DD_ITEM.WHITE_CRYSTAL_3),
        [DD_ITEM.WHITE_CRYSTAL_4]:       cx(DD_ITEM.WHITE_CRYSTAL_4),
        [DD_ITEM.WHITE_CRYSTAL_5]:       cx(DD_ITEM.WHITE_CRYSTAL_5),
        [DD_ITEM.BLUE_CRYSTAL_1]:        cx(DD_ITEM.BLUE_CRYSTAL_1),
        [DD_ITEM.BLUE_CRYSTAL_2]:        cx(DD_ITEM.BLUE_CRYSTAL_2),
        [DD_ITEM.BLUE_CRYSTAL_3]:        cx(DD_ITEM.BLUE_CRYSTAL_3),
        [DD_ITEM.BLUE_CRYSTAL_4]:        cx(DD_ITEM.BLUE_CRYSTAL_4),
        [DD_ITEM.BLUE_CRYSTAL_5]:        cx(DD_ITEM.BLUE_CRYSTAL_5),
        [DD_ITEM.PRISMORA_CRYSTAL_1]:    cx(DD_ITEM.PRISMORA_CRYSTAL_1),
        [DD_ITEM.PRISMORA_CRYSTAL_2]:    cx(DD_ITEM.PRISMORA_CRYSTAL_2),
        [DD_ITEM.PRISMORA_CRYSTAL_3]:    cx(DD_ITEM.PRISMORA_CRYSTAL_3),
        [DD_ITEM.PRISMORA_CRYSTAL_4]:    cx(DD_ITEM.PRISMORA_CRYSTAL_4),
        [DD_ITEM.PRISMORA_CRYSTAL_5]:    cx(DD_ITEM.PRISMORA_CRYSTAL_5),
        [DD_ITEM.SCORE]:                 Math.min(nn(result.score), 9999999),
        [DD_ITEM.PLAYER_XP]:             nn(result.playerXp),
        [DD_ITEM.DUNGEON_LEVEL_REACHED]: levelDelta,
        [DD_ITEM.ENEMIES_KILLED]:        nn(result.stats.enemiesKilled),
        [DD_ITEM.SLIMES_KILLED]:         nn(result.stats.slimesKilled),
        [DD_ITEM.SKELETONS_KILLED]:      nn(result.stats.skeletonsKilled),
        [DD_ITEM.KNIGHTS_KILLED]:        nn(result.stats.knightsKilled),
        [DD_ITEM.FRANKENSTEINS_KILLED]:  nn(result.stats.frankensteinsKilled),
        [DD_ITEM.DEVILS_KILLED]:         nn(result.stats.devilsKilled),
        [DD_ITEM.CRYSTALS_MINED]:        nn(result.stats.crystalsMined),
      };
      const ok = commitLocalPlayerEconomySync({
        action: actionIds.gameOver,
        amounts,
        nextPlayerEconomy: applied.playerEconomy,
      });
      if (ok) {
        submitScore({ token: jwt, score: result.score }).catch(() => {});
      }
      return ok;
    },
    [actionIds.gameOver, commitLocalPlayerEconomySync, jwt, playerEconomy],
  );

  /** Mints 3 free attempts. Server enforces 24h cooldown. Returns true on success. */
  const claimFreeAttempts = useCallback((): boolean => {
    const applied = applyDeepDungeonFreeAttempts(playerEconomy);
    if (!applied.ok) return false;
    return commitLocalPlayerEconomySync({
      action: actionIds.freeAttempts,
      nextPlayerEconomy: applied.playerEconomy,
    });
  }, [actionIds.freeAttempts, commitLocalPlayerEconomySync, playerEconomy]);

  return { startGame, endRun, claimFreeAttempts };
}
