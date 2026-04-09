import { atom } from "nanostores";
import { NPC_WEARABLES, type NPCName } from "lib/npcs";
import { tokenUriBuilder, type BumpkinParts } from "lib/utils/tokenUriBuilder";
import { clearBumpkinHunterGameOverSessionFlag } from "./bumpkinHunterPortal";
import type { MinigameSessionEconomyMeta } from "lib/portal/types";

/** Bumpkins on screen per round; eat order is a permutation of this set. */
export const HIDE_AND_SEEK_BUMPKIN_COUNT = 30;

export type HideAndSeekNpcSpawn = {
  npcName: NPCName;
  tokenParts: string;
};

export type HideAndSeekRound = {
  /** Order the player must bump into NPCs (permutation of those on screen). */
  eatOrder: readonly HideAndSeekNpcSpawn[];
  /** NPCs to spawn in the scene (same set as eat order, any layout order). */
  npcSpawnList: readonly HideAndSeekNpcSpawn[];
  eatProgress: number;
  rewardClaimed: boolean;
};

export const $hideAndSeekRound = atom<HideAndSeekRound | null>(null);

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function allNpcNames(): NPCName[] {
  return Object.keys(NPC_WEARABLES) as NPCName[];
}

function toSpawn(npcName: NPCName): HideAndSeekNpcSpawn {
  return {
    npcName,
    tokenParts: tokenUriBuilder(NPC_WEARABLES[npcName] as BumpkinParts),
  };
}

/** First NPC name in `NPC_WEARABLES` that matches this token (for UI labels). */
export function resolveNpcNameForTokenParts(
  tokenParts: string,
): NPCName | undefined {
  for (const name of allNpcNames()) {
    if (toSpawn(name).tokenParts === tokenParts) return name;
  }
  return undefined;
}

/** One entry per distinct bumpkin look (`tokenParts`), for no duplicates on screen. */
function allUniqueTokenSpawns(): HideAndSeekNpcSpawn[] {
  const seen = new Set<string>();
  const out: HideAndSeekNpcSpawn[] = [];
  for (const name of allNpcNames()) {
    const spawn = toSpawn(name);
    if (seen.has(spawn.tokenParts)) continue;
    seen.add(spawn.tokenParts);
    out.push(spawn);
  }
  return out;
}

export function getCurrentEatTarget(
  round: HideAndSeekRound | null,
): HideAndSeekNpcSpawn | null {
  if (!round || round.eatProgress >= round.eatOrder.length) return null;
  return round.eatOrder[round.eatProgress] ?? null;
}

export function advanceHideAndSeekEat(): void {
  const r = $hideAndSeekRound.get();
  if (!r) return;
  $hideAndSeekRound.set({ ...r, eatProgress: r.eatProgress + 1 });
}

/** Random NPC for a respawn; never returns a token already on screen. */
export function pickReplacementHideAndSeekNpc(
  excludeTokenParts: ReadonlySet<string>,
): HideAndSeekNpcSpawn {
  for (const name of shuffle(allNpcNames())) {
    const spawn = toSpawn(name);
    if (!excludeTokenParts.has(spawn.tokenParts)) return spawn;
  }
  for (const name of allNpcNames()) {
    const spawn = toSpawn(name);
    if (!excludeTokenParts.has(spawn.tokenParts)) return spawn;
  }
  throw new Error("hideAndSeek: no unused bumpkin token for replacement");
}

/** Picks random NPCs from `lib/npcs` and a random eat order (unique looks only). */
export function prepareHideAndSeekRound(): HideAndSeekRound {
  clearBumpkinHunterGameOverSessionFlag();
  const pool = shuffle(allUniqueTokenSpawns());
  const npcSpawnList = pool.slice(0, HIDE_AND_SEEK_BUMPKIN_COUNT);
  const eatOrder = shuffle([...npcSpawnList]);
  const round: HideAndSeekRound = {
    eatOrder,
    npcSpawnList,
    eatProgress: 0,
    rewardClaimed: false,
  };
  $hideAndSeekRound.set(round);
  return round;
}

function tokenSet(
  rows: readonly { tokenParts: string }[],
): Set<string> | null {
  const s = new Set<string>();
  for (const r of rows) {
    const t = typeof r.tokenParts === "string" ? r.tokenParts.trim() : "";
    if (!t) return null;
    if (s.has(t)) return null;
    s.add(t);
  }
  return s;
}

function isValidApiRoundPayload(
  raw: unknown,
): raw is {
  eatOrder: HideAndSeekNpcSpawn[];
  npcSpawnList: HideAndSeekNpcSpawn[];
} {
  if (!raw || typeof raw !== "object") return false;
  const eatOrder = (raw as { eatOrder?: unknown }).eatOrder;
  const npcSpawnList = (raw as { npcSpawnList?: unknown }).npcSpawnList;
  if (!Array.isArray(eatOrder) || !Array.isArray(npcSpawnList)) return false;
  if (
    eatOrder.length !== HIDE_AND_SEEK_BUMPKIN_COUNT ||
    npcSpawnList.length !== HIDE_AND_SEEK_BUMPKIN_COUNT
  ) {
    return false;
  }
  const rows = [...eatOrder, ...npcSpawnList] as {
    npcName?: unknown;
    tokenParts?: unknown;
  }[];
  for (const row of rows) {
    if (typeof row.npcName !== "string" || typeof row.tokenParts !== "string") {
      return false;
    }
  }
  const eatTokens = tokenSet(eatOrder as HideAndSeekNpcSpawn[]);
  const spawnTokens = tokenSet(npcSpawnList as HideAndSeekNpcSpawn[]);
  if (!eatTokens || !spawnTokens || eatTokens.size !== spawnTokens.size) {
    return false;
  }
  for (const t of eatTokens) {
    if (!spawnTokens.has(t)) return false;
  }
  return true;
}

/**
 * After Minigames session load: use `dashboard.hideAndSeekRound` when valid,
 * otherwise same as {@link prepareHideAndSeekRound}.
 */
export function prepareHideAndSeekRoundFromSession(
  dashboard: MinigameSessionEconomyMeta["dashboard"] | undefined,
): HideAndSeekRound {
  const fromApi = dashboard?.hideAndSeekRound;
  if (fromApi && isValidApiRoundPayload(fromApi)) {
    clearBumpkinHunterGameOverSessionFlag();
    const round: HideAndSeekRound = {
      eatOrder: fromApi.eatOrder,
      npcSpawnList: fromApi.npcSpawnList,
      eatProgress: 0,
      rewardClaimed: false,
    };
    $hideAndSeekRound.set(round);
    return round;
  }
  return prepareHideAndSeekRound();
}

export function markHideAndSeekRewardClaimed(): void {
  const r = $hideAndSeekRound.get();
  if (r) {
    $hideAndSeekRound.set({ ...r, rewardClaimed: true });
  }
}
