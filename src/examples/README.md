# Examples

Reference games and demos. **`App.tsx`** chooses which one is the default shell.

## Kale Kings (`kale-kings/`) — **default**

Two routes: **`/`** game-style kingdom scene, **`/adventure`** Phaser “hidden forest” (5 pickups).

- **Economy:** Kale / Magical Kale / Golden Kale + **Giant Kales** (passive **1 Kale / 8h each**). Full rules in **`docs/GAME_SPEC.md`** (Kale Kings) and code in **`kaleKingsRules.ts`** + **`kaleKingsStore.ts`**.
- **Home UX:** **`kingdom/KingdomGameScene`** (sky, ground, Giant Kale sprites, bumpkin home placeholder) + floating **HUD**; **FORAGE RUN** / **shop** / **patch** open **modals** (`RunPickerModal`, `ShopModal`, `GiantKaleModal`).
- **Runs:** Pay Kale → minigame → rolled loot by zone (Meadow / Forest / Mystio). **Unlocks** spend Magical/Golden. **+1 Giant Kale** costs **1 Golden**.

**Router:** `react-router-dom`. Static hosts need SPA fallback for **`/adventure`**.

**Art:** Kale Kings uses bundled files in **`src/examples/kale-kings/assets/`** (`kale.png`, `crystal_kale.png`, `golden_kale.png`, `giant_kale.webp`, `kale_mix.png`) via **`kaleAssets.ts`**; **`RESOURCE_CONFIG.kale`** points at `kale.png` for `<ResourceImage name="kale" />` elsewhere.

## Bumpkin maze (`pacman/`)

Grid chase — mount **`PacmanExample`** if you want it as the main app.

## Minimal Phaser demo

**`PhaserGame`** + **`MainScene`** — walking bumpkin and **Space** demo SFX.
