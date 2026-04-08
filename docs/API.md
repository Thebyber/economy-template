# API.md

> **Audience:** Developers and agents wiring backend or mock services.

## Agent summary

**Portal minigames** use **`src/lib/portal/`** — **`getPlayerEconomySession`** (`GET {MinigamesApi}/data?type=session`) and **`postPlayerEconomyAction`** (`POST …/action` with `type: "minigame.action"`); portal id comes from the JWT only (same as Chicken Rescue v2). **`GAMEOVER`** / other actions must send **`amounts` keys** that match the economy config for **that** portal (e.g. bumpkin-hunter skull mint is usually token **`"0"`**; chicken-rescue-v2 **`GAMEOVER`** mints chooks on **`"1"`** and burns **`LIVE_GAME`** — set **`VITE_GAMEOVER_MINT_TOKEN_KEY=1`** if you test with a chicken-rescue JWT). **Generic profile / trade stubs** live in **`src/lib/api.ts`**: **fake delays**, **TODO** comments, **`coins`**, **`anonymous`**. Replace stubs when you integrate services.

## Current contract (template)

### `PlayerProfile`

```ts
interface PlayerProfile {
  coins: number;
  anonymous: boolean;
}
```

- **`coins`:** primary inflating currency for demos and early loops.
- **`anonymous`:** `true` when not signed in; use in UI to nudge signup (no auth in template).

### Functions (stubs)

| Function | Purpose |
|----------|---------|
| `loadPlayerProfile()` | Fetch or mock profile; hydrates game store. |
| `submitScore` | TODO — post session result. |
| `purchaseUpgrade` | TODO — spend currency / unlock. |
| `tradeCoinsForAxe` | Example **coins → tool** trade (stub). |
| `tradeAxeForWood` | Example **tool → resource** (stub). |
| `tradeWoodForCollectible` | Example **resource → collectible** (stub). |

Implementations live in **`src/lib/api.ts`**.

Visual inventory rows should use **`ResourceImage`** + **`RESOURCE_CONFIG`** (`src/config/resources.config.ts`), not ad-hoc URLs.

## Design guidance (economy)

- **Quick / inflating** resources: earned often in-session (e.g. coins from actions).
- **Slower / tradeable** resources: require time, skill, or purchase; design game loops so key moments revolve around these (see `DESIGN.md`).

## Environment

- Add real base URLs in `.env` when you connect services (see `.env.sample`).
- Do **not** commit secrets; document required vars here when you add them.

## Related docs

- `TECHNICAL.md` — hydrating `gameStore` from API.
- `ARCHITECTURE.md` — where API modules live.
