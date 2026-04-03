/**
 * Kale Kings art bundled from `examples/kale-kings/assets/`.
 * Swap files in that folder to refresh in-game art (Vite will hash URLs).
 */
import kaleUrl from "examples/kale-kings/assets/kale.png";
import crystalKaleUrl from "examples/kale-kings/assets/crystal_kale.png";
import goldenKaleUrl from "examples/kale-kings/assets/golden_kale.png";
import giantKaleUrl from "examples/kale-kings/assets/giant_kale.webp";
import kaleMixUrl from "examples/kale-kings/assets/kale_mix.png";

export const KALE_KINGS_ASSETS = {
  /** Basic Kale — HUD, Phaser pickups */
  kale: kaleUrl,
  /** Magical Kale — HUD */
  magical: crystalKaleUrl,
  /** Golden Kale — HUD */
  golden: goldenKaleUrl,
  /** Giant Kale — passive / kingdom panel */
  giant: giantKaleUrl,
  /** Meadow / mixed forage — run list accent */
  mix: kaleMixUrl,
} as const;
