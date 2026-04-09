# Player economy — builder guide

This doc is for **people building minigames** that plug into Sunflower Land’s **economies API**: how the game is opened, which HTTP calls to make, and how **published economy actions** behave. You do **not** need access to any private backend codebase.

---

## The economies API and why you need the JWT

Player minigames talk to Sunflower Land’s **public economies API**. In production the base URL is typically:

**`https://economies-api.sunflower-land.com`**


That API is **intentionally limited**: it lets an authenticated **player** (via their **JWT**) **fetch** data for **your** published economy (session snapshot, rules, balances, jobs) and **perform a small set of operations**—the **session** load and the **action** posts described below. It is not a full admin or editor API; it only exposes what players need inside the iframe.

**You must send the JWT on every request** to that host, as a Bearer token:

`Authorization: Bearer <jwt>`

Without a valid token, the API will not return farm-specific economy state or accept actions for that player.

---

## How your app loads

1. Sunflower Land opens your game inside an **iframe** (your published minigame URL).
2. The parent passes the **portal JWT** on the query string in the URL of your game, typically **`?jwt=…`**. Read this on startup; it is the same token you pass to **`https://economies-api.sunflower-land.com`** (or your configured base URL) as **`Authorization: Bearer …`**.
3. On first paint (or before gameplay), call **session** (below) so you have **rules** (`actions`, `items`, …) and **this farm’s state** (`playerEconomy`: balances, items, …).

If the token is missing or expired, show your own “session expired” or “open from the game” message.

---

## The main economies API calls

All requests use the **same base URL** (e.g. `https://economies-api.sunflower-land.com`) and the **same JWT** in the `Authorization` header. Paths below are relative to that base.

### 1. Session — load rules + player state

| | |
|---|---|
| **Use when** | App boot, or after you need a full refresh of config and balances. |
| **Request** | `GET /data?type=session` |
| **Headers** | `Authorization: Bearer <jwt>`, `Accept: application/json` |
| **Returns** | A payload that includes your published **`actions`** and **`items`**, plus **`playerEconomy`** (e.g. `balances`, `generating` for in‑progress jobs, optional **`highscore`**). |

Use this to render HUDs, shops, timers, and to know which **action ids** exist before you POST anything.

**Example shape** (illustrative; field names match the live API — `jsonc` allows `//` comments):

```jsonc
{
  "farm": {
    "balance": "1250", // Bumpkin’s main-game currency as a string (not economy tokens)
    "bumpkin": {} // Avatar / wearables snapshot from the parent game (shape varies)
  },
  "playerEconomy": {
    "balances": { "energy": 5, "lives": 3 }, // Your economy token keys → counts
    "generating": {
      // Job id → timer; collect with POST generator.collected + itemId when completesAt <= now
      "a1b2c3d4": {
        "outputToken": "Timber",
        "startedAt": 1710000000000,
        "completesAt": 1710000005000
      }
    },
    "activity": 42, // Lifetime successful economy actions (named + generator collects)
    "dailyActivity": { "date": "2026-04-10", "count": 3 }, // UTC-day action count
    "dailyMinted": {
      "utcDay": "2026-04-10",
      "minted": { "RUN|Coin": 120 } // Per-action/token daily mint totals (keys vary)
    },
    "highscore": 9876 // Present after at least one score.submitted; best score for this farm
  },
  "actions": {}, // Published rules keyed by action id (same ids you POST as "action")
  "items": {}, // Token metadata: names, images, marketplace ids, …
  "playUrl": "https://your-portal.minigames.sunflower-land.com", // Canonical play origin for this economy
  "mainCurrencyToken": "energy" // Optional HUD hint for primary token key
}
```

---

### 2. Action — `type: "minigame.action"` (named economy rule)

| | |
|---|---|
| **Use when** | The player does something that should run a **named rule** from the economy editor (start run, game over, buy item, claim daily reward, …). |
| **Request** | `POST /action` |
| **Body** | `{ "type": "minigame.action", "action": "<actionId>" }` and optionally `"amounts": { "<tokenKey>": <integer>, … }` for ranged mint/burn. |
| **Headers** | `Authorization: Bearer <jwt>`, `Content-Type: application/json` |

The string **`action`** must match the **id** of a published action. The server validates **burn**, **mint**, **require**, **produce**, etc. exactly as configured; if something fails, you get an error instead of silent success.

---

### 3. Action — `type: "generator.collected"` (harvest a timed job)

| | |
|---|---|
| **Use when** | A generator job in **`playerEconomy.generating`** has finished (`now >= completesAt`) and the player collects the output. |
| **Request** | `POST /action` |
| **Body** | `{ "type": "generator.collected", "itemId": "<jobId>" }` |
| **Headers** | Same as above |

**`itemId`** is the **object key** of that job in `generating` (not an editor action id). Starting production is still done with a normal **`minigame.action`** that includes **produce** / **collect** rules in the editor; harvesting is always this separate POST.

---

### 4. Action — `score.submitted` (persist a run score / highscore)

| | |
|---|---|
| **Use when** | The player finishes a run (or level) and you want a **single persisted best score** for this farm in this economy — not a balance token. |
| **Request** | `POST /action` |
| **Body** | `{ "type": "minigame.action", "action": "score.submitted", "score": <non-negative integer> }` |
| **Headers** | Same as above |

**`score.submitted`** is a **reserved** action name: you do **not** define it in the economy editor. The server stores **`playerEconomy.highscore`** if this is the first submit, or **replaces** it only when **`score`** is **strictly greater** than the saved value. Use **`minigame.action`** with other ids for mint/burn rules; use this dedicated POST for leaderboard-style scores.

---

## Example: one action in the editor and how to call it

Suppose the economy defines an action id **`START_RUN`** that should cost one **energy** token and grant three **lives**. In the editor, that rule is stored as JSON-shaped fields on that action, conceptually like:

```json
{
  "burn": {
    "energy": { "amount": 1 }
  },
  "mint": {
    "lives": { "amount": 3 }
  }
}
```

**What the fields mean (typical behaviour):**

| Field | Role |
|--------|------|
| **`burn`** | Tokens **removed** from the player if they have enough. Can be a fixed `amount` or a min/max range; ranged rules require a matching key in the POST **`amounts`** object. |
| **`mint`** | Tokens **added**. Fixed `amount` in the rule, or a range with **`amounts`** in the request for ranged rules. |
| **`require`** | Player must **already have** at least N of a token (a gate; not the same as burning). |
| **`requireBelow` / `requireAbsent`** | Extra gates (caps, “don’t already own”, etc.) depending on your rule. |
| **`produce` / `collect`** | Start a **timed job** and define what **collecting** that job grants. Start = `minigame.action`; finish = **`generator.collected`** with the job’s id. |

**Calling it:**

```http
POST /action
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "type": "minigame.action",
  "action": "START_RUN"
}
```

**Example: submitting a run score** (server updates **`playerEconomy.highscore`** when the value improves):

```json
{
  "type": "minigame.action",
  "action": "score.submitted",
  "score": 12450
}
```

For **ranged mint/burn** rules you still send **`amounts`** with **`minigame.action`** and a normal editor action id; keys must match the token keys in the rule, and values must sit inside the configured min/max.

**Successful responses** include an updated view of the economy / `playerEconomy` (exact shape depends on the service). Prefer that **authoritative** state over guessing deltas on the client.

---

## What you need as a builder

| Need | Why |
|------|-----|
| **Economy slug** | Must match the **portal id** inside the JWT. If they differ, session load fails (“unknown economy”). |
| **Portal JWT** | Passed as **`?jwt=…`** when the iframe loads; send it as **Bearer** on every call above. |
| **Economies API base URL** | e.g. **`https://economies-api.sunflower-land.com`** in production; your build or config should point **`/data`** and **`/action`** at that host. |
| **Action ids** | Must match the strings you published in the editor when calling **`minigame.action`**. |

---

## Mental model

- **Session** — One read that gives you **config + current player state**. Refresh after big changes if you want a simple mental model.
- **Named actions** — **`minigame.action`** runs **one** published rule by id (with optional **`amounts`** for ranged mint/burn).
- **Generator harvest** — **`generator.collected`** completes **one** running job by **`itemId`** (job key in `generating`).
- **Highscore** — **`score.submitted`** updates **`playerEconomy.highscore`** when the posted score beats the stored best (reserved action id, not in the editor).

You should not invent balance changes only in the client if you care about persistence: the server enforces what you published. You can still **predict** updates for snappy UI, then reconcile with the response.

---

## Designing your economy (editor → game)

Think in **token keys** (strings, often `"0"`, `"1"`, …) and **actions** (named ids).

- **Items** — Display names, art, trade flags, starting balances.
- **Shop-style actions** — Often **burn** + **mint**, or **require** + **mint**, plus optional daily / lifetime limits on the action.
- **Generators** — **produce** starts a job; **`generating`** in session holds **startedAt** / **completesAt**; **collect** rules define the payout when you POST **`generator.collected`**.
- **Iframe-only actions** — You can hide an action from a default shop UI with **`showInShop: false`** and only invoke it from your game code.

---

## Local development

- Point your client at the economies API base URL for your environment (production example: **`https://economies-api.sunflower-land.com`**).
- Open your app with **`?jwt=…`** from the economy editor or portal “play” flow so the same token works as **`Authorization: Bearer`** on the economies API.
- Without a valid URL + token, implement an **offline** path if you need to work on layout or mechanics without the network.

---

## Gotchas

- **`score.submitted`** requires a non‑negative integer **`score`**; do not send **`amounts`** on that action.
- **`amounts`** keys must match **mint/burn** token keys in the published rule.
- **Portal id in the JWT** must match the economy **slug** you saved in the editor.
- After any **`POST /action`**, use the returned **player economy / balances** from the server when possible (chance-based collects, daily caps, and purchase limits are easy to get wrong if you only guess on the client).

---

## Demo profile API (separate from the economy)

Some template demos use a small **stub** HTTP client for generic profile/coins — that is **not** the player economy pipeline described here.

---

## Related docs

- [`TECHNICAL.md`](./TECHNICAL.md) — React ↔ Phaser, stores, popups.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Where code lives in this repo (if you use the template).
