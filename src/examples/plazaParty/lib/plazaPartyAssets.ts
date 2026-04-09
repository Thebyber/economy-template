import { CONFIG } from "lib/config";

/**
 * Extruded world tilesheet — same path as Sunflower Land’s `Preloader` (`map-extruded.png`).
 * Keep map JSON + `load.image` on this URL so the example matches production assets.
 */
export function plazaPartyTilesetUrl(): string {
  return `${CONFIG.PROTECTED_IMAGE_URL}/world/map-extruded.png`;
}

export function plazaPartyWildMushroomUrl(): string {
  return `${CONFIG.PROTECTED_IMAGE_URL}/resources/wild_mushroom.png`;
}
