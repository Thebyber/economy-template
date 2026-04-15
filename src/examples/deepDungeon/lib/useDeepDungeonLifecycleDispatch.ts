import { useCallback } from "react";
import { useMinigameSession } from "lib/portal";
import { useDeepDungeonActionIds } from "./useDeepDungeonActionIds";
import {
  applyDeepDungeonStartGame,
  applyDeepDungeonGameOver,
  type DeepDungeonRunResult,
} from "./deepDungeonLifecycle";
import { calcPlayerStats, type DeepDungeonPlayerStats } from "./deepDungeonLifecycle";

export function useDeepDungeonLifecycleDispatch() {
  const { commitLocalPlayerEconomySync, playerEconomy } = useMinigameSession();
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
      return commitLocalPlayerEconomySync({
        action: actionIds.gameOver,
        nextPlayerEconomy: applied.playerEconomy,
      });
    },
    [actionIds.gameOver, commitLocalPlayerEconomySync, playerEconomy],
  );

  return { startGame, endRun };
}
