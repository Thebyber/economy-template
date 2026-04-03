import { atom } from "nanostores";
import {
  type RunZone,
  RUN_COST_KALE,
  UNLOCK_FOREST_MAGICAL,
  UNLOCK_MYSTIO,
  GIANT_KALE_GOLDEN_COST,
  passiveKaleAccrued,
  nextPassiveClaimAfterCollect,
} from "examples/kale-kings/kaleKingsRules";

export type PendingLoot = { magical: number; golden: number };

export type KaleKingsState = {
  /** Basic currency — runs & unlocks (sinks) */
  kale: number;
  magicalKale: number;
  goldenKale: number;
  giantKaleCount: number;
  /** Timestamp of last passive settlement (each period × giants → +kale) */
  lastPassiveClaimAt: number;

  meadowUnlocked: boolean;
  forestUnlocked: boolean;
  mystioUnlocked: boolean;

  /** Run in progress (fee already paid) */
  activeRunZone: RunZone | null;

  adventureKaleFound: number;
  adventureSuccessPending: boolean;
  /** Rolled when the forest minigame completes; applied on Claim */
  pendingRunLoot: PendingLoot | null;
};

const DEMO_START = Date.now() - 8 * 60 * 60 * 1000;

export const $kaleKingsState = atom<KaleKingsState>({
  kale: 8,
  magicalKale: 0,
  goldenKale: 0,
  giantKaleCount: 1,
  lastPassiveClaimAt: DEMO_START,

  meadowUnlocked: true,
  forestUnlocked: false,
  mystioUnlocked: false,

  activeRunZone: null,
  adventureKaleFound: 0,
  adventureSuccessPending: false,
  pendingRunLoot: null,
});

export function patchKaleKingsState(partial: Partial<KaleKingsState>): void {
  $kaleKingsState.set({ ...$kaleKingsState.get(), ...partial });
}

export function startAdventureMinigame(): void {
  patchKaleKingsState({
    adventureKaleFound: 0,
    adventureSuccessPending: false,
    pendingRunLoot: null,
  });
}

export function canAffordRun(zone: RunZone, s = $kaleKingsState.get()): boolean {
  if (zone === "meadow" && !s.meadowUnlocked) return false;
  if (zone === "forest" && !s.forestUnlocked) return false;
  if (zone === "mystio" && !s.mystioUnlocked) return false;
  return s.kale >= RUN_COST_KALE[zone];
}

/** Pay entry and mark zone (caller must navigate to /adventure). */
export function payAndBeginRun(zone: RunZone): boolean {
  if (!canAffordRun(zone)) return false;
  const s = $kaleKingsState.get();
  const cost = RUN_COST_KALE[zone];
  patchKaleKingsState({
    kale: s.kale - cost,
    activeRunZone: zone,
  });
  startAdventureMinigame();
  return true;
}

export function claimPassiveKale(): boolean {
  const s = $kaleKingsState.get();
  const { periods, kale } = passiveKaleAccrued(
    s.lastPassiveClaimAt,
    s.giantKaleCount,
  );
  if (periods < 1 || kale < 1) return false;
  patchKaleKingsState({
    kale: s.kale + kale,
    lastPassiveClaimAt: nextPassiveClaimAfterCollect(
      s.lastPassiveClaimAt,
      periods,
    ),
  });
  return true;
}

export function unlockForest(): boolean {
  const s = $kaleKingsState.get();
  if (s.forestUnlocked || s.magicalKale < UNLOCK_FOREST_MAGICAL) return false;
  patchKaleKingsState({
    magicalKale: s.magicalKale - UNLOCK_FOREST_MAGICAL,
    forestUnlocked: true,
  });
  return true;
}

export function unlockMystio(): boolean {
  const s = $kaleKingsState.get();
  if (
    s.mystioUnlocked ||
    s.magicalKale < UNLOCK_MYSTIO.magical ||
    s.goldenKale < UNLOCK_MYSTIO.golden
  ) {
    return false;
  }
  patchKaleKingsState({
    magicalKale: s.magicalKale - UNLOCK_MYSTIO.magical,
    goldenKale: s.goldenKale - UNLOCK_MYSTIO.golden,
    mystioUnlocked: true,
  });
  return true;
}

export function buyGiantKale(): boolean {
  const s = $kaleKingsState.get();
  if (s.goldenKale < GIANT_KALE_GOLDEN_COST) return false;
  patchKaleKingsState({
    goldenKale: s.goldenKale - GIANT_KALE_GOLDEN_COST,
    giantKaleCount: s.giantKaleCount + 1,
  });
  return true;
}

/** Called from Phaser when all pickups collected — sets loot from active zone. */
export function setAdventureCompleteLoot(loot: PendingLoot): void {
  patchKaleKingsState({
    adventureSuccessPending: true,
    pendingRunLoot: loot,
  });
}

export function claimAdventureReward(): void {
  const s = $kaleKingsState.get();
  const loot = s.pendingRunLoot;
  if (!loot) {
    patchKaleKingsState({
      adventureSuccessPending: false,
      adventureKaleFound: 0,
      activeRunZone: null,
    });
    return;
  }
  patchKaleKingsState({
    magicalKale: s.magicalKale + loot.magical,
    goldenKale: s.goldenKale + loot.golden,
    adventureSuccessPending: false,
    adventureKaleFound: 0,
    pendingRunLoot: null,
    activeRunZone: null,
  });
}

/** Leaving the forest minigame early — entry fee is not refunded. */
export function abandonAdventureRun(): void {
  patchKaleKingsState({
    activeRunZone: null,
    adventureKaleFound: 0,
    adventureSuccessPending: false,
    pendingRunLoot: null,
  });
}
