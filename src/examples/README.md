# Examples

## Boring (`boring/`) — **default**

Minimal **portal** demo mounted from **`App.tsx`** via **`BoringApp`**.

- **Routes:** **`/`** — welcome screen; loads **`GET {MinigamesApi}/data?type=session`** with a portal JWT when **`VITE_MINIGAMES_API_URL`** (or **`?minigamesApiUrl=`**) is set. **`/game`** — **`PhaserGame`** + **`MainScene`** (arrow keys move **`BumpkinContainer`**).
- **API:** `src/lib/portal/` — `getPlayerEconomySession`, `postPlayerEconomyAction`, `getMinigamesApiUrl` / `getUrl` / `getJwt` (same behaviour as Chicken Rescue v2). Example client action defs: **`lib/boringClientActions.ts`** (no server `processAction` in this template).
- **Env / query:** `VITE_MINIGAMES_API_URL` + `minigamesApiUrl`; main API `VITE_API_URL` + `apiUrl` / `network` for portal login; `jwt` (see `lib/portal/url.ts`).
