import { CONFIG } from "lib/config";
import { postPlayerEconomyAction } from "lib/portal/api";
import { getJwt } from "lib/portal/url";

const SESSION_GAMEOVER_KEY = "hideSeek.bumpkinHunter.gameOverActionPosted";

/** Cleared when a new round is prepared so win or loss can POST GAMEOVER once per run. */
export function clearBumpkinHunterGameOverSessionFlag(): void {
  try {
    sessionStorage.removeItem(SESSION_GAMEOVER_KEY);
  } catch {
    // ignore
  }
}

/** Returns true if we should POST GAMEOVER (guards duplicate modals / React Strict Mode). */
export function markBumpkinHunterGameOverPosting(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_GAMEOVER_KEY)) return false;
    sessionStorage.setItem(SESSION_GAMEOVER_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/** Matches minigame editor action id for bumpkin-hunter. */
export const BUMPKIN_HUNTER_GAMEOVER_ACTION = "GAMEOVER";

/**
 * Token key for `amounts` on GAMEOVER (must match `actions.GAMEOVER.mint` in the player economy
 * for this portal). Override with `VITE_GAMEOVER_MINT_TOKEN_KEY` (e.g. `1` for chicken-rescue-v2).
 */
export const gameoverMintTokenKey = (): string => CONFIG.GAMEOVER_MINT_TOKEN_KEY;

/** Align with GAMEOVER mint rule max in portal config (server validates range). */
const GAMEOVER_MINT_MAX = 50;

/**
 * Notify the portal API that the run ended so the server can apply GAMEOVER mint rules.
 * Pass skulls earned this run (`eatProgress` = correct catches before modal).
 * No-op without JWT (e.g. local dev). Portal id is taken from the token server-side.
 */
export async function postBumpkinHunterGameOver(skullAmountThisRun: number): Promise<void> {
  const jwt = getJwt();
  if (!jwt) return;

  const n = Math.floor(Number(skullAmountThisRun));
  const clamped = Math.max(0, Math.min(GAMEOVER_MINT_MAX, Number.isFinite(n) ? n : 0));

  await postPlayerEconomyAction({
    token: jwt,
    action: BUMPKIN_HUNTER_GAMEOVER_ACTION,
    amounts: { [gameoverMintTokenKey()]: clamped },
  });
}
