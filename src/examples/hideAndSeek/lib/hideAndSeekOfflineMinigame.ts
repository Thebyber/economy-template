import type { MinigameSessionResponse } from "lib/portal";
import { emptySessionMinigame } from "lib/portal/runtimeHelpers";

/** Offline / no `VITE_MINIGAMES_API_URL`: empty economy; round is generated locally. */
export function createHideAndSeekOfflineMinigame(
  now = Date.now(),
): MinigameSessionResponse["playerEconomy"] {
  return emptySessionMinigame(now);
}
