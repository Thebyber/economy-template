/**
 * Build-time portal / API settings (mirrors Chicken Rescue `lib/config` subset).
 */
const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const PORTAL_APP = import.meta.env.VITE_PORTAL_APP as string | undefined;
const PORTAL_GAME_URL = import.meta.env.VITE_PORTAL_GAME_URL as string | undefined;
const ANIMATION_URL = import.meta.env.VITE_ANIMATION_URL as string | undefined;
/** Minigames API Gateway: `/data`, `/action`, `/animate/...`, `/bumpkins/metadata/...`. */
const MINIGAMES_API_URL = import.meta.env.VITE_MINIGAMES_API_URL as
  | string
  | undefined;

/**
 * Economy `items` key passed in `amounts` for `GAMEOVER` ranged mint (must match the portal
 * config’s `actions.GAMEOVER.mint`). Bumpkin Hunter / skull-style configs typically use `"0"`;
 * chicken-rescue-v2 uses `"1"` for chooks.
 */
const GAMEOVER_MINT_TOKEN_KEY = (
  import.meta.env.VITE_GAMEOVER_MINT_TOKEN_KEY as string | undefined
)?.trim();

export const CONFIG = {
  API_URL,
  PORTAL_APP,
  PORTAL_GAME_URL,
  ANIMATION_URL,
  MINIGAMES_API_URL,
  /** Default `"0"` when env unset; set to `1` when testing with chicken-rescue-v2 JWT. */
  GAMEOVER_MINT_TOKEN_KEY: GAMEOVER_MINT_TOKEN_KEY || "0",
};
