# GAME_SPEC.md

> **Living document.** Clone maintainers edit this file as the single source for **numbers**, **rules**, and **content** specific to **their** mini-game.

## Agent summary

Before changing code, update this spec when you alter: **starting resources**, **win/lose conditions**, **timers**, **costs**, **enemy counts**, or **progression tiers**. Agents should read this file when implementing balance or UI copy tied to rules.

**Default shell:** `App` + `PhaserGame` run **`MainScene`** (walking bumpkin + demo resource). That is the product surface unless you replace it.

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

## Optional reference: Bumpkin maze (`src/examples/pacman/`)

> **Not** loaded by default. Mount **`PacmanExample`** from `examples/pacman/PacmanExample` if you want this scene (see `src/examples/README.md`).

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
