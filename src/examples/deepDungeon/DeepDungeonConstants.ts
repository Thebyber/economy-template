import { Equipped } from "features/game/types/bumpkin";
import { translate } from "lib/i18n/translate";

export type AnimationKeys =
  | "walk"
  | "idle"
  | "carry"
  | "carryIdle"
  | "attack"
  | "mining"
  | "axe"
  | "hammering"
  | "swimming"
  | "drill"
  | "dig"
  | "dead";

export const PLAYER_DAMAGE = 2;
export const REWARD_ENERGY = 15;
export const POTION_RESTORE = 8;

export const INVENTORY_CAPS = {
  pickaxe: 15,
  potion: 10,
  key_chest: 5,
} as const;
export const PORTAL_NAME = "deep-dungeon";
export const PORTAL_TOKEN = "Deep Token";
export const UNLIMITED_ATTEMPTS_COST = 3;
export const RESTOCK_ATTEMPTS_COST = 1;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;

export const onAnimationComplete = (
  object: Phaser.GameObjects.Sprite,
  animKey: string,
  callback: () => void,
) => {
  object?.once(
    Phaser.Animations.Events.ANIMATION_COMPLETE,
    (anim: Phaser.Animations.Animation) => {
      if (anim.key === animKey) {
        callback();
      }
    },
  );
};
export interface CrystalConfig {
  type: string;
  level: number;
  count: number;
}

interface DropTable {
  energyDrops: { amount: number; weight: number }[];
}
export const CRYSTAL_DROP_TABLE: Record<string, DropTable> = {
  pink_crystal_1: {
    energyDrops: [
      { amount: 3, weight: 40 },
      { amount: 4, weight: 20 },
      { amount: 5, weight: 30 },
      { amount: 6, weight: 10 },
    ],
  },
  pink_crystal_2: {
    energyDrops: [
      { amount: 4, weight: 40 },
      { amount: 5, weight: 20 },
      { amount: 6, weight: 30 },
      { amount: 7, weight: 10 },
    ],
  },
  pink_crystal_3: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  pink_crystal_4: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  pink_crystal_5: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  white_crystal_1: {
    energyDrops: [
      { amount: 4, weight: 40 },
      { amount: 5, weight: 20 },
      { amount: 6, weight: 30 },
      { amount: 7, weight: 10 },
    ],
  },
  white_crystal_2: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  white_crystal_3: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  white_crystal_4: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  white_crystal_5: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  blue_crystal_1: {
    energyDrops: [
      { amount: 5, weight: 40 },
      { amount: 6, weight: 20 },
      { amount: 7, weight: 30 },
      { amount: 8, weight: 10 },
    ],
  },
  blue_crystal_2: {
    energyDrops: [
      { amount: 6, weight: 40 },
      { amount: 7, weight: 20 },
      { amount: 8, weight: 30 },
      { amount: 9, weight: 10 },
    ],
  },
  blue_crystal_3: {
    energyDrops: [
      { amount: 7, weight: 40 },
      { amount: 8, weight: 20 },
      { amount: 9, weight: 30 },
      { amount: 10, weight: 10 },
    ],
  },
  blue_crystal_4: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  blue_crystal_5: {
    energyDrops: [
      { amount: 9, weight: 40 },
      { amount: 10, weight: 20 },
      { amount: 11, weight: 30 },
      { amount: 12, weight: 10 },
    ],
  },
  prismora_crystal_1: {
    energyDrops: [
      { amount: 8, weight: 40 },
      { amount: 9, weight: 20 },
      { amount: 10, weight: 30 },
      { amount: 11, weight: 10 },
    ],
  },
  prismora_crystal_2: {
    energyDrops: [
      { amount: 9, weight: 40 },
      { amount: 10, weight: 20 },
      { amount: 11, weight: 30 },
      { amount: 12, weight: 10 },
    ],
  },
  prismora_crystal_3: {
    energyDrops: [
      { amount: 10, weight: 40 },
      { amount: 11, weight: 20 },
      { amount: 12, weight: 30 },
      { amount: 13, weight: 10 },
    ],
  },
  prismora_crystal_4: {
    energyDrops: [
      { amount: 11, weight: 40 },
      { amount: 12, weight: 20 },
      { amount: 13, weight: 30 },
      { amount: 14, weight: 10 },
    ],
  },
  prismora_crystal_5: {
    energyDrops: [
      { amount: 12, weight: 40 },
      { amount: 13, weight: 20 },
      { amount: 14, weight: 30 },
      { amount: 15, weight: 10 },
    ],
  },
};

export interface EnemyConfig {
  type: "SKELETON" | "SLIME" | "KNIGHT" | "FRANKENSTEIN" | "DEVIL"; // Añade aquí más tipos si tienes
  count: number;
}

export interface LevelDesign {
  enemies: EnemyConfig[];
  traps: number;
  crystals: CrystalConfig[];
  pickaxes: number;
}
export interface LevelConfig {
  playerStart: { x: number; y: number };
}

export const LEVEL_MAPS: Record<number, LevelConfig> = {
  1: {
    playerStart: { x: 160, y: 128 },
  },
  2: {
    playerStart: { x: 32, y: 64 },
  },
  3: {
    playerStart: { x: 240, y: 64 },
  },
  4: {
    playerStart: { x: 288, y: 48 },
  },
  5: {
    playerStart: { x: 64, y: 64 },
  },
  6: {
    playerStart: { x: 48, y: 48 },
  },
  7: {
    playerStart: { x: 192, y: 256 },
  },
  8: {
    playerStart: { x: 64, y: 64 },
  },
  9: {
    playerStart: { x: 64, y: 256 },
  },
  10: {
    playerStart: { x: 64, y: 272 },
  },
  11: {
    playerStart: { x: 160, y: 128 },
  },
  12: {
    playerStart: { x: 32, y: 64 },
  },
  13: {
    playerStart: { x: 240, y: 64 },
  },
  14: {
    playerStart: { x: 288, y: 48 },
  },
  15: {
    playerStart: { x: 64, y: 64 },
  },
  16: {
    playerStart: { x: 48, y: 48 },
  },
  17: {
    playerStart: { x: 192, y: 256 },
  },
  18: {
    playerStart: { x: 64, y: 64 },
  },
  19: {
    playerStart: { x: 64, y: 256 },
  },
  20: {
    playerStart: { x: 64, y: 272 },
  },
};
export const LEVEL_SETTINGS: Record<
  number,
  { fogColor: number; fogAlpha: number }
> = {
  1: { fogColor: 0x191a27, fogAlpha: 0.7 },
  2: { fogColor: 0x191a27, fogAlpha: 0.8 },
  3: { fogColor: 0x191a27, fogAlpha: 0.9 },
  4: { fogColor: 0x191a27, fogAlpha: 1.0 },
  5: { fogColor: 0x191a27, fogAlpha: 1.0 },
  6: { fogColor: 0x271714, fogAlpha: 1.0 },
  7: { fogColor: 0x271714, fogAlpha: 1.0 },
  8: { fogColor: 0x271714, fogAlpha: 1.0 },
  9: { fogColor: 0x271714, fogAlpha: 1.0 },
  10: { fogColor: 0x271714, fogAlpha: 1.0 },
  11: { fogColor: 0x191a27, fogAlpha: 0.7 },
};
export const LEVEL_DESIGNS: Record<number, LevelDesign> = {
  // P1: 4 slimes + 2 skeletons = 6
  1: {
    enemies: [
      { type: "SLIME", count: 4 },
      { type: "SKELETON", count: 2 },
    ],
    traps: 3,
    crystals: [
      { type: "pink", level: 1, count: 5 },
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
    ],
    pickaxes: 3,
  },
  // P2: 4 slimes + 3 skeletons = 7
  2: {
    enemies: [
      { type: "SLIME", count: 4 },
      { type: "SKELETON", count: 3 },
    ],
    traps: 4,
    crystals: [
      { type: "pink", level: 2, count: 4 },
      { type: "pink", level: 4, count: 2 },
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P3: 3 slimes + 3 skeletons + 2 knights = 8
  3: {
    enemies: [
      { type: "SLIME", count: 3 },
      { type: "SKELETON", count: 3 },
      { type: "KNIGHT", count: 2 },
    ],
    traps: 4,
    crystals: [
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P4: 2 slimes + 4 skeletons + 3 knights = 9
  4: {
    enemies: [
      { type: "SLIME", count: 2 },
      { type: "SKELETON", count: 4 },
      { type: "KNIGHT", count: 3 },
    ],
    traps: 5,
    crystals: [
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
    ],
    pickaxes: 3,
  },
  // P5: 2 slimes + 3 skeletons + 3 knights + 2 franks = 10
  5: {
    enemies: [
      { type: "SLIME", count: 2 },
      { type: "SKELETON", count: 3 },
      { type: "KNIGHT", count: 3 },
      { type: "FRANKENSTEIN", count: 2 },
    ],
    traps: 5,
    crystals: [
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P6: 1 slime + 3 skeletons + 4 knights + 3 franks = 11
  6: {
    enemies: [
      { type: "SLIME", count: 1 },
      { type: "SKELETON", count: 3 },
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 3 },
    ],
    traps: 6,
    crystals: [
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P7: 2 skeletons + 5 knights + 4 franks + 1 devil = 12
  7: {
    enemies: [
      { type: "SKELETON", count: 2 },
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 4 },
      { type: "DEVIL", count: 1 },
    ],
    traps: 6,
    crystals: [
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
    ],
    pickaxes: 3,
  },
  // P8: 2 skeletons + 4 knights + 4 franks + 2 devils = 12
  8: {
    enemies: [
      { type: "SKELETON", count: 2 },
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 4 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 7,
    crystals: [
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P9: 1 skeleton + 4 knights + 5 franks + 3 devils = 13
  9: {
    enemies: [
      { type: "SKELETON", count: 1 },
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 5 },
      { type: "DEVIL", count: 3 },
    ],
    traps: 7,
    crystals: [
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
      { type: "prismora", level: 2, count: 4 },
      { type: "prismora", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P10: 4 knights + 6 franks + 4 devils = 14
  10: {
    enemies: [
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 6 },
      { type: "DEVIL", count: 4 },
    ],
    traps: 8,
    crystals: [
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
      { type: "prismora", level: 5, count: 1 },
    ],
    pickaxes: 3,
  },
  // P11: 3 skeletons + 4 knights + 3 franks + 2 devils = 12
  11: {
    enemies: [
      { type: "SKELETON", count: 3 },
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 3 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 8,
    crystals: [
      { type: "pink", level: 1, count: 5 },
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
    ],
    pickaxes: 3,
  },
  // P12: 2 skeletons + 5 knights + 3 franks + 2 devils = 12
  12: {
    enemies: [
      { type: "SKELETON", count: 2 },
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 3 },
      { type: "DEVIL", count: 2 },
    ],
    traps: 8,
    crystals: [
      { type: "pink", level: 2, count: 4 },
      { type: "pink", level: 4, count: 2 },
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P13: 1 skeleton + 5 knights + 4 franks + 3 devils = 13
  13: {
    enemies: [
      { type: "SKELETON", count: 1 },
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 4 },
      { type: "DEVIL", count: 3 },
    ],
    traps: 9,
    crystals: [
      { type: "pink", level: 3, count: 3 },
      { type: "pink", level: 5, count: 1 },
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P14: 5 knights + 5 franks + 3 devils = 13
  14: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 5 },
      { type: "DEVIL", count: 3 },
    ],
    traps: 9,
    crystals: [
      { type: "white", level: 1, count: 5 },
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
    ],
    pickaxes: 3,
  },
  // P15: 5 knights + 5 franks + 4 devils = 14
  15: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 5 },
      { type: "DEVIL", count: 4 },
    ],
    traps: 9,
    crystals: [
      { type: "white", level: 2, count: 4 },
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P16: 2 skeletons + 4 knights + 4 franks + 3 devils = 13
  16: {
    enemies: [
      { type: "SKELETON", count: 2 },
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 4 },
      { type: "DEVIL", count: 3 },
    ],
    traps: 10,
    crystals: [
      { type: "white", level: 3, count: 3 },
      { type: "white", level: 5, count: 1 },
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P17: 5 knights + 5 franks + 4 devils = 14
  17: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 5 },
      { type: "DEVIL", count: 4 },
    ],
    traps: 10,
    crystals: [
      { type: "white", level: 4, count: 2 },
      { type: "blue", level: 1, count: 5 },
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
    ],
    pickaxes: 3,
  },
  // P18: 4 knights + 6 franks + 4 devils = 14
  18: {
    enemies: [
      { type: "KNIGHT", count: 4 },
      { type: "FRANKENSTEIN", count: 6 },
      { type: "DEVIL", count: 4 },
    ],
    traps: 10,
    crystals: [
      { type: "blue", level: 2, count: 4 },
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
    ],
    pickaxes: 3,
  },
  // P19: 5 knights + 6 franks + 4 devils = 15
  19: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 6 },
      { type: "DEVIL", count: 4 },
    ],
    traps: 10,
    crystals: [
      { type: "blue", level: 3, count: 3 },
      { type: "blue", level: 5, count: 1 },
      { type: "prismora", level: 2, count: 4 },
      { type: "prismora", level: 4, count: 2 },
    ],
    pickaxes: 3,
  },
  // P20: 5 knights + 6 franks + 5 devils = 16
  20: {
    enemies: [
      { type: "KNIGHT", count: 5 },
      { type: "FRANKENSTEIN", count: 6 },
      { type: "DEVIL", count: 5 },
    ],
    traps: 10,
    crystals: [
      { type: "blue", level: 4, count: 2 },
      { type: "prismora", level: 1, count: 5 },
      { type: "prismora", level: 3, count: 3 },
      { type: "prismora", level: 5, count: 1 },
    ],
    pickaxes: 3,
  },
};

/**
 * Returns the level design for any level.
 * - Levels 1–20: exact config from LEVEL_DESIGNS.
 * - Levels 21+:  same pattern as floors 19-20 (knights/franks/devils) with slight
 *                random variation (±1 per type) so it never feels identical.
 *                Crystals/traps cycle through levels 11–20.
 */
export function getLevelDesign(level: number): LevelDesign {
  if (level <= 20) return LEVEL_DESIGNS[level] ?? LEVEL_DESIGNS[1];

  // Cycle crystals & traps through levels 11–20
  const baseLevel = ((level - 11) % 10) + 11;
  const base = LEVEL_DESIGNS[baseLevel];

  const vary = () => Math.floor(Math.random() * 3) - 1; // -1, 0, or +1

  const enemies: EnemyConfig[] = [
    { type: "KNIGHT",       count: Math.max(3, 5 + vary()) },
    { type: "FRANKENSTEIN", count: Math.max(4, 6 + vary()) },
    { type: "DEVIL",        count: Math.max(3, 5 + vary()) },
  ];

  return {
    enemies,
    traps: base.traps,
    crystals: base.crystals,
    pickaxes: 3,
  };
}

/**
 * Returns the fog color for any level, cycling levels 21+ through the 1–10 palette.
 */
export function getLevelFogColor(level: number): number {
  const effectiveLevel = level <= 20 ? level : ((level - 1) % 10) + 1;
  return LEVEL_SETTINGS[effectiveLevel]?.fogColor ?? 0x191a27;
}

// También puedes mover otras constantes que tengas por ahí
export const TILE_SIZE = 16;
export interface PlayerStats {
  attack: number;
  defense: number;
  energy: number;
  maxEnergy: number;
  criticalChance: number;
  inventory: {
    pickaxe: number;
    potion: number;
    key_chest: number;
    [key: string]: number; // Permite otros items como los cristales
  };
}
export interface DropItem {
  sprite: string;
  label: string;
  action: (stats: PlayerStats) => void;
}

export const DROP_ITEMS_CONFIG: Record<string, DropItem> = {
  ATTACK: {
    sprite: "sword",
    label: "+1 Attack",
    action: (stats) => {
      stats.attack += 1;
    },
  },
  DEFENSE: {
    sprite: "shield",
    label: "+1 Defense",
    action: (stats) => {
      stats.defense += 1;
    },
  },
  CRIT: {
    sprite: "crit",
    label: "+2% Critical Chance",
    action: (stats) => {
      stats.criticalChance += 2;
    },
  },
  PICKAXE: {
    sprite: "pickaxe",
    label: "+1 Pickaxe",
    action: (stats) => {
      stats.inventory.pickaxe += 1;
    },
  },
  POTION: {
    sprite: "potion",
    label: "+1 Potion",
    action: (stats) => {
      stats.inventory.potion += 1;
    },
  },
  KEY_CHEST: {
    sprite: "key_chest",
    label: "+1 Key Chest",
    action: (stats) => {
      stats.inventory.key_chest += 1;
    },
  },
  DEEP_COIN: {
    sprite: "deep_token",
    label: "+1 Deep Coin",
    action: (_stats) => {
      // Handled separately via phaserApi.onDeepCoinDropped — no stat mutation needed.
    },
  },
};

export type DropKey = keyof typeof DROP_ITEMS_CONFIG;

// ── Card system ───────────────────────────────────────────────────────────────

export interface Card {
  type: "Common" | "Rare" | "Epic" | "Legendary";
  name: string;
  color: string;
  bonus: Record<string, number>;
  icon: "attack" | "lightning" | "pickaxe" | "crit" | "defense" | "key_chest" | "potion";
}

export const CARD_POOL: Card[] = [
  // Common
  { name: "+2% Critical Chance", type: "Common", color: "#ffffff", bonus: { criticalChance: 2 }, icon: "crit" },
  { name: "+1 Defense", type: "Common", color: "#ffffff", bonus: { defense: 1 }, icon: "defense" },
  { name: "+1 Attack", type: "Common", color: "#ffffff", bonus: { attack: 1 }, icon: "attack" },
  { name: "+1 Pickaxe", type: "Common", color: "#ffffff", bonus: { pickaxe: 1 }, icon: "pickaxe" },
  { name: "+5 Max Energy", type: "Common", color: "#ffffff", bonus: { maxEnergy: 5 }, icon: "lightning" },
  { name: "+8 Max Energy", type: "Common", color: "#ffffff", bonus: { maxEnergy: 8 }, icon: "lightning" },
  { name: "+1 Potion", type: "Common", color: "#ffffff", bonus: { potion: 1 }, icon: "potion" },
  // Rare
  { name: "+2 Attack", type: "Rare", color: "#4592e5", bonus: { attack: 2 }, icon: "attack" },
  { name: "+10 Max Energy", type: "Rare", color: "#4592e5", bonus: { maxEnergy: 10 }, icon: "lightning" },
  { name: "+12 Max Energy", type: "Rare", color: "#4592e5", bonus: { maxEnergy: 12 }, icon: "lightning" },
  { name: "+5% Critical Chance", type: "Rare", color: "#4592e5", bonus: { criticalChance: 5 }, icon: "crit" },
  { name: "+2 Defense", type: "Rare", color: "#4592e5", bonus: { defense: 2 }, icon: "defense" },
  { name: "+2 Pickaxe", type: "Rare", color: "#4592e5", bonus: { pickaxe: 2 }, icon: "pickaxe" },
  { name: "+2 Potion", type: "Rare", color: "#4592e5", bonus: { potion: 2 }, icon: "potion" },
  { name: "+1 Key Chest", type: "Rare", color: "#4592e5", bonus: { key_chest: 1 }, icon: "key_chest" },
  
  // Epic
  { name: "+3 Attack", type: "Epic", color: "#b145e5", bonus: { attack: 3 }, icon: "attack" },
  { name: "+3 Pickaxe", type: "Epic", color: "#b145e5", bonus: { pickaxe: 3 }, icon: "pickaxe" },
  { name: "+15 Max Energy", type: "Epic", color: "#b145e5", bonus: { maxEnergy: 15 }, icon: "lightning" },
  { name: "+20 Max Energy", type: "Epic", color: "#b145e5", bonus: { maxEnergy: 20 }, icon: "lightning" },
  { name: "+3 Defense", type: "Epic", color: "#b145e5", bonus: { defense: 3 }, icon: "defense" },
  { name: "+7% Critical Chance", type: "Epic", color: "#b145e5", bonus: { criticalChance: 7 }, icon: "crit" },
  { name: "+3 Potion", type: "Epic", color: "#b145e5", bonus: { potion: 3 }, icon: "potion" },
  { name: "+2 Key Chest", type: "Epic", color: "#b145e5", bonus: { key_chest: 2 }, icon: "key_chest" },
  // Legendary
  { name: "+5 Attack", type: "Legendary", color: "#ff8c00", bonus: { attack: 5 }, icon: "attack" },
  { name: "+5 Defense", type: "Legendary", color: "#ff8c00", bonus: { defense: 5 }, icon: "defense" },
  { name: "+12% Critical Chance", type: "Legendary", color: "#ff8c00", bonus: { criticalChance: 12 }, icon: "crit" },
  { name: "+25 Max Energy", type: "Legendary", color: "#ff8c00", bonus: { maxEnergy: 25 }, icon: "lightning" },
  { name: "+30 Max Energy", type: "Legendary", color: "#ff8c00", bonus: { maxEnergy: 30 }, icon: "lightning" },
  { name: "+5 Pickaxe", type: "Legendary", color: "#ff8c00", bonus: { pickaxe: 5 }, icon: "pickaxe" },
  { name: "+5 Potion", type: "Legendary", color: "#ff8c00", bonus: { potion: 5 }, icon: "potion" },
  { name: "+3 Key Chest", type: "Legendary", color: "#ff8c00", bonus: { key_chest: 3 }, icon: "key_chest" },
];

export const getRandomCard = (): Card => {
  const rand = Math.random() * 100;
  let rarity: Card["type"];
  if (rand < 3) rarity = "Legendary";
  else if (rand < 15) rarity = "Epic";
  else if (rand < 40) rarity = "Rare";
  else rarity = "Common";
  const pool = CARD_POOL.filter((c) => c.type === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
};

export const DUNGEON_POINTS = {
  CRYSTALS: {
    pink_crystal_1: 100,
    pink_crystal_2: 200,
    pink_crystal_3: 300,
    pink_crystal_4: 400,
    pink_crystal_5: 500,
    white_crystal_1: 150,
    white_crystal_2: 300,
    white_crystal_3: 450,
    white_crystal_4: 600,
    white_crystal_5: 750,
    blue_crystal_1: 200,
    blue_crystal_2: 400,
    blue_crystal_3: 600,
    blue_crystal_4: 800,
    blue_crystal_5: 1000,
    prismora_crystal_1: 250,
    prismora_crystal_2: 500,
    prismora_crystal_3: 750,
    prismora_crystal_4: 1000,
    prismora_crystal_5: 1250,
  },
  ENEMIES: {
    SKELETON: 200,
    SLIME: 100,
    KNIGHT: 400,
    FRANKENSTEIN: 600,
    DEVIL: 1000,
  },
  CHEST_OPEN: 500,
  LEVEL_REWARD: (level: number) => level * 50,
};

export const DEEPDUNGEON_NPC_WEARABLES: Equipped = {
  hair: "Greyed Glory",
  body: "Infernal Bumpkin Potion",
  shirt: "Skull Shirt",
  pants: "Crimstone Pants",
  shoes: "Crimstone Boots",
  tool: "Skinning Knife",
  hat: "Skull Hat",
};

export const BLACKSMITH_NPC_WEARABLES: Equipped = {
  body: "Light Brown Farmer Potion",
  hair: "Blacksmith Hair",
  pants: "Lumberjack Overalls",
  shirt: "SFL T-Shirt",
  tool: "Hammer",
  background: "Pumpkin Plaza Background",
  shoes: "Brown Boots",
};

//Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/map_2.webp",
    description: translate("deepdungeon.instructions1"),
  },
  {
    image: "world/DeepDungeonAssets/lightning.png",
    description: translate("deepdungeon.instructions2"),
  },
  {
    image: "world/DeepDungeonAssets/pirate_bounty.webp",
    description: translate("deepdungeon.instructions3"),
  },
  {
    image: "world/DeepDungeonAssets/sword.png",
    description: translate("deepdungeon.instructions4"),
  },
  {
    image: "world/DeepDungeonAssets/pickaxe.png",
    description: translate("deepdungeon.instructions5"),
  },
  {
    image: "world/DeepDungeonAssets/Stairs.png",
    description: translate("deepdungeon.instructions6"),
  },
  {
    image: "world/DeepDungeonAssets/chest.png",
    description: translate("deepdungeon.instructions7"),
  },
];
export const POINTS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/pink_crystal_3.png",
    description: translate("deepdungeon.points1"),
  },
  {
    image: "world/DeepDungeonAssets/white_crystal_1.png",
    description: translate("deepdungeon.points2"),
  },
  {
    image: "world/DeepDungeonAssets/blue_crystal_4.png",
    description: translate("deepdungeon.points3"),
  },
  {
    image: "world/DeepDungeonAssets/prismora_crystal_5.png",
    description: translate("deepdungeon.points4"),
  },
  {
    image: "world/DeepDungeonAssets/slime.png",
    description: translate("deepdungeon.points5"),
  },
  {
    image: "world/DeepDungeonAssets/skeleton.png",
    description: translate("deepdungeon.points6"),
  },
  {
    image: "world/DeepDungeonAssets/knight.png",
    description: translate("deepdungeon.points7"),
  },
  {
    image: "world/DeepDungeonAssets/frankenstein.png",
    description: translate("deepdungeon.points8"),
  },
  {
    image: "world/DeepDungeonAssets/devil.png",
    description: translate("deepdungeon.points9"),
  },
  {
    image: "world/DeepDungeonAssets/chest_open.png",
    description: translate("deepdungeon.points10"),
  },
  {
    image: "world/DeepDungeonAssets/Stairs.png",
    description: translate("deepdungeon.points11"),
  },
  {
    image: "world/DeepDungeonAssets/xp.png",
    description: translate("deepdungeon.points12"),
  },
];
export const ENEMIES_GUIDE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/slime.png",
    description: translate("deepdungeon.enemies1"),
  },
  {
    image: "world/DeepDungeonAssets/skeleton.png",
    description: translate("deepdungeon.enemies2"),
  },
  {
    image: "world/DeepDungeonAssets/knight.png",
    description: translate("deepdungeon.enemies3"),
  },
  {
    image: "world/DeepDungeonAssets/frankenstein.png",
    description: translate("deepdungeon.enemies4"),
  },
  {
    image: "world/DeepDungeonAssets/devil.png",
    description: translate("deepdungeon.enemies5"),
  },
];
export const STATS_GUIDE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/lightning.png",
    description: translate("deepdungeon.stats1"),
  },
  {
    image: "world/DeepDungeonAssets/heart.png",
    description: translate("deepdungeon.stats2"),
  },
  {
    image: "world/DeepDungeonAssets/sword.png",
    description: translate("deepdungeon.stats3"),
  },
  {
    image: "world/DeepDungeonAssets/AoEatq.png",
    description: translate("deepdungeon.stats4"),
  },
  {
    image: "world/DeepDungeonAssets/shield.png",
    description: translate("deepdungeon.stats5"),
  },
  {
    image: "world/DeepDungeonAssets/crit.png",
    description: translate("deepdungeon.stats6"),
  },
  {
    image: "world/DeepDungeonAssets/potion.png",
    description: translate("deepdungeon.stats7"),
  },
  {
    image: "world/DeepDungeonAssets/key_chest.png",
    description: translate("deepdungeon.stats8"),
  },
  {
    image: "world/DeepDungeonAssets/greenbar_02.png",
    description: translate("deepdungeon.stats9"),
  },
  {
    image: "world/DeepDungeonAssets/redbar_02.png",
    description: translate("deepdungeon.stats10"),
  },
];
export const MOVE_GUIDE: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: "world/DeepDungeonAssets/key.png",
    description: translate("deepdungeon.move1"),
  },
  {
    image: "world/DeepDungeonAssets/phone.png",
    description: translate("deepdungeon.move2"),
  },
];
