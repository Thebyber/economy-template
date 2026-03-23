/**
 * Visual mapping for the Pac-Man-style maze example.
 * All textures must come from `icons.config.ts` / `resources.config.ts` (`@sl-assets`);
 * characters use `BumpkinContainer` (animation CDN) — do not swap in ad-hoc vector art.
 */
import type { IconName } from "config/icons.config";
import type { ResourceName } from "config/resources.config";

export const PACMAN_VISUAL = {
  /** One texture tiled per `#` cell in the ASCII maze */
  wallResource: "stone" satisfies ResourceName,
  /** Small pickup (maps to `ICON_CONFIG`) */
  pelletIcon: "disc" satisfies IconName,
  /** Large pickup (maps to `RESOURCE_CONFIG`) */
  powerResource: "diamond" satisfies ResourceName,
} as const;

/** Default farmer look (same default as `BumpkinContainer`). */
export const PACMAN_PLAYER_TOKEN = "32_1_5_13_18_22_23";

/**
 * Distinct bumpkin DNA strings for “ghost” farmers (chasers).
 * Swap for your fork’s valid `0_v1_*` segments if these 404 on your CDN.
 */
export const PACMAN_GHOST_TOKENS = [
  "33_1_5_13_18_22_23",
  "34_1_5_13_18_22_23",
] as const;
