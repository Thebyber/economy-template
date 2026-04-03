# GAME_SPEC.md

> **Living document.** Clone maintainers edit this file as the single source for **numbers**, **rules**, and **content** specific to **their** mini-game.

## Agent summary

Before changing code, update this spec when you alter: **starting resources**, **win/lose conditions**, **timers**, **costs**, **enemy counts**, or **progression tiers**. Agents should read this file when implementing balance or UI copy tied to rules.

**Default shell:** `App` renders **`KaleKingsApp`** — **`/`** kingdom economy + **`/adventure`** hidden-forest Phaser run (**five** pickups, zone-based loot). Rules & numbers: **`kaleKingsRules.ts`**. Swap `App.tsx` for **`PacmanExample`** or **`PhaserGame`** if you prefer those demos.

When changing **Phaser visuals**, read **`ART.md`** and keep walls/pickups mapped to **`icons.config.ts` / `resources.config.ts`** (`@sl-assets`) — do not introduce one-off URLs or vector-drawn gameplay tiles where pixel assets exist.

---

## Game identity (your fork)

- **Working title:** _[your game name]_
- **One-line pitch:** _[what the player does in one sentence]_

## Core loop (fill in)

1. _[Step 1]_
2. _[Step 2]_
3. _[Step 3]_

## Win / lose (your fork)

- **Win condition:** _[e.g. reach score X, survive Y seconds]_
- **Lose condition:** _[e.g. run out of lives]_
- **Retry:** _[what resets vs what persists]_

## Resources (your fork)

| Resource | Type | Notes |
|----------|------|-------|
| Coins | profile (stub) | `$gameState.coins` from `loadPlayerProfile` |
| _[add rows]_ | | |

---

## Kale Kings (`src/examples/kale-kings/`)

> **Loaded by default** via **`KaleKingsApp`**. State: **`kaleKingsStore.ts`**. Constants & dice: **`kaleKingsRules.ts`**. UI uses **placeholder divs** for Magical / Golden Kale icons until final art.

### Pitch

Upgrade the village into a **Kale Kingdom**. You start with **1 Giant Kale** and grow the economy through passive Kale, forage runs (Phaser minigame), and area unlocks.

### Currencies

| Currency | Role |
|----------|------|
| **Kale** | Pays run entry; basic “soft” layer |
| **Magical Kale** | Unlocks **Forest**; produced by Meadow / Forest runs |
| **Golden Kale** | Unlocks **Mystio** (with Magical); buys **+1 Giant Kale**; produced by Forest / Mystio |

### Sources

| Source | Output |
|--------|--------|
| **Free (Giant Kale)** | Every **8 hours**, **each** Giant Kale produces **1 Kale** (kingdom **Collect**). |
| **Meadow run** (Area I) | **1–5** Magical Kale (rolled on run success). |
| **Forest run** | **1–10** Magical Kale, **0–1** Golden Kale. |
| **Mystio run** | **0–3** Golden Kale. |

### Sinks (costs)

| Sink | Cost | Notes |
|------|------|--------|
| **Meadow run** | **1 Kale** | Requires Meadow (starts unlocked). |
| **Forest run** | **5 Kale** | Requires Forest unlocked. |
| **Mystio run** | **25 Kale** | Requires Mystio unlocked. |
| **Unlock Forest** | **25 Magical Kale** | One-time. |
| **Unlock Mystio** | **150 Magical** + **50 Golden** | One-time. |
| **+1 Giant Kale** | **1 Golden Kale** | Stacks passive Kale production. |

### Minigame

- **Explore the hidden forest:** bumpkin walks an empty field; **5** hidden Kale pickups. Collect all → modal shows **rolled loot** for that zone → **Claim** credits Magical/Golden and returns **`/`**.
- **Leaving via ← Kingdom** without finishing **does not refund** the run fee.

### Routes

| Path | Role |
|------|------|
| `/` | **Game-style kingdom:** full-screen scene (Giant Kale patch, bumpkin “home”), corner **HUD**, **FORAGE RUN** opens run picker (costs + unlocks), **patch tap** → harvest modal, **shop** button → buy Giant Kale |
| `/adventure` | Phaser run (must arrive with router `state.zone` after paying on `/`) |

## Bumpkin maze (`src/examples/pacman/`)

> Optional — mount **`PacmanExample`** from `App.tsx` instead of **`KaleKingsApp`** (see `src/examples/README.md`).

### Identity

- **Pitch:** Arrow keys move your bumpkin on a grid; collect pickups; avoid rival bumpkins; walls are **resource** sprites from `@sl-assets`.

### Loop & rules

1. Navigate with queued turns at tile centers (`examples/pacman/PacmanScene.ts`).
2. Small pickup +10 score, large +50; win when no pickups remain.
3. **3** lives; caught by chaser costs 1 life; **0** lives = lose.

**Retry:** **Play again** in the example overlay restarts `PacmanScene`. **Best score** lives in **`$pacmanExampleState`** (`pacmanExampleStore.ts`), not `$gameState`.

### Visual asset mapping

| Role | Implementation | Config / source |
|------|----------------|-----------------|
| Player | `BumpkinContainer` | `PACMAN_PLAYER_TOKEN` in `src/examples/pacman/pacman.config.ts` |
| Chasers | `BumpkinContainer` × N | `PACMAN_GHOST_TOKENS` in same file |
| Wall cells (`#`) | Phaser `image` per cell | `PACMAN_VISUAL.wallResource` → `RESOURCE_CONFIG` (default **stone**) |
| Small pickup | Phaser `image` | `PACMAN_VISUAL.pelletIcon` → `ICON_CONFIG` (default **disc**) |
| Large pickup | Phaser `image` | `PACMAN_VISUAL.powerResource` → `RESOURCE_CONFIG` (default **diamond**) |
| Silhouette / shadow | Phaser preload | `public/game/silhouette.webp`, `public/game/shadow.png` |

**Agents:** Change keys only in **`examples/pacman/pacman.config.ts`** (or extend `icons.config.ts` / `resources.config.ts`). Do **not** replace with `Graphics` primitives.

### Maze layout

- ASCII: `src/examples/pacman/maze.ts` (`RAW`). Cell size = **`SQUARE_WIDTH`** (16px).

### Copy (example overlay)

- **Win:** “You cleared the maze!”
- **Lose:** “Game over”

---

## Out of scope (this file)

- Does **not** replace `DESIGN.md` (philosophy) or `TECHNICAL.md` (implementation).

## Related docs

- `DESIGN.md`, `VALIDATION.md`, `API.md`, `ART.md`, `TECHNICAL.md`, `../src/examples/README.md`
