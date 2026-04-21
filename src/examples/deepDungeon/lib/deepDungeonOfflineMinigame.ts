import type { MinigameSessionResponse } from "lib/portal";
import { emptyPlayerEconomyState } from "lib/portal/processAction";
import { runtimeToMinigameSession } from "lib/portal/runtimeHelpers";
import { DD_ITEM } from "./deepDungeonItemIds";

/** Offline dev: give the player a generous starting state for local testing. */
export function createDeepDungeonOfflineMinigame(
  now = Date.now(),
): MinigameSessionResponse["playerEconomy"] {
  const base = emptyPlayerEconomyState(now);

  // 3 attempts to start with
  base.balances[DD_ITEM.ATTEMPTS] = 3;

  // A few deep coins and crystals for testing
  base.balances[DD_ITEM.DEEP_COIN] = 50;
  base.balances[DD_ITEM.PINK_CRYSTAL_1] = 10;
  base.balances[DD_ITEM.PINK_CRYSTAL_2] = 10;
  base.balances[DD_ITEM.PINK_CRYSTAL_3] = 10;

  return runtimeToMinigameSession(base);
}
