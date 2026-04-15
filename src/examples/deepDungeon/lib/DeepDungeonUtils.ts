/**
 * Utility helpers for Deep Dungeon (Economy API version).
 * Attempts are now tracked as a balance in the economy dashboard (item "1").
 * Use `playerEconomy.balances[DD_ITEM.ATTEMPTS]` directly instead of the old Minigame history.
 */
import type { MinigameSessionResponse } from "lib/portal";
import { DD_ITEM } from "./deepDungeonItemIds";

type Economy = MinigameSessionResponse["playerEconomy"];

/** Returns the number of attempts remaining for the current player. */
export const getAttemptsLeft = (economy: Economy): number => {
  return economy.balances[DD_ITEM.ATTEMPTS] ?? 0;
};

/** Returns true if the player has at least one attempt remaining. */
export const hasAttemptsLeft = (economy: Economy): boolean => {
  return getAttemptsLeft(economy) > 0;
};
