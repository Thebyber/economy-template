import { DropKey } from "../DeepDungeonConstants";

export interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  defense: number;
  trapDamage: number;
  sprite: string;
  isAggressive: boolean;
  isRanged: boolean;
  damageAoE: number; // Solo para enemigos con ataque de área
  criticalChance?: number;
  dropChance: number; // Probabilidad de que suelte ALGO (ej: 0.5 = 50%)
  lootTable: { key: DropKey; weight: number }[]; // Lista de posibles objetos
}

export type EnemyType =
  | "SKELETON"
  | "SLIME"
  | "KNIGHT"
  | "FRANKENSTEIN"
  | "DEVIL";

export const ENEMY_DEBUT_FLOORS: Record<EnemyType, number> = {
  SLIME: 1,
  SKELETON: 1,
  KNIGHT: 3,
  FRANKENSTEIN: 5,
  DEVIL: 7,
};

export function getScaledEnemyStats(type: EnemyType, floor: number): EnemyStats {
  const base = ENEMY_TYPES[type];
  const debut = ENEMY_DEBUT_FLOORS[type];
  const nivel = Math.max(1, Math.floor((floor - debut) / 2) + 1);
  const mult = Math.pow(1.2, nivel - 1);
  return {
    ...base,
    hp: Math.round(base.hp * mult),
    damage: Math.round(base.damage * mult),
    defense: Math.round(base.defense * mult),
    damageAoE: Math.round(base.damageAoE * mult),
    trapDamage: Math.round(base.trapDamage * mult),
    criticalChance: (base.criticalChance ?? 0) + 0.01 * (nivel - 1),
  };
}

export const ENEMY_TYPES: Record<EnemyType, EnemyStats> = {
  SKELETON: {
    name: "skeleton",
    hp: 6,
    damage: 3,
    defense: 1,
    criticalChance: 0.05,
    trapDamage: 1,
    damageAoE: 0,
    sprite: "skeleton",
    isAggressive: false,
    isRanged: false,
    dropChance: 0.8, // 80% de soltar algo
    lootTable: [
      { key: "DEEP_COIN", weight: 0.01 },
      { key: "ATTACK", weight: 0.01 },
      { key: "PICKAXE", weight: 0.45 },
      { key: "POTION", weight: 0.45 },
      { key: "KEY_CHEST", weight: 0.08 },
    ],
  },
  SLIME: {
    name: "slime",
    hp: 4,
    damage: 2,
    defense: 1,
    criticalChance: 0.02,
    trapDamage: 1,
    damageAoE: 0,
    sprite: "slime",
    isAggressive: false,
    isRanged: false,
    dropChance: 0.8, // 80% de soltar algo
    lootTable: [
      { key: "DEEP_COIN", weight: 0.01 },
      { key: "PICKAXE", weight: 0.39 },
      { key: "POTION", weight: 0.59 },
      { key: "KEY_CHEST", weight: 0.01 },
    ],
  },
  KNIGHT: {
    name: "knight",
    hp: 10,
    damage: 5,
    defense: 2,
    criticalChance: 0.08,
    trapDamage: 0,
    damageAoE: 0,
    sprite: "knight",
    isAggressive: false,
    isRanged: false,
    dropChance: 0.85, // 85% de soltar algo
    lootTable: [
      { key: "DEEP_COIN", weight: 0.01 },
      { key: "DEFENSE", weight: 0.01 },
      { key: "POTION", weight: 0.40 },
      { key: "KEY_CHEST", weight: 0.08 },
      { key: "PICKAXE", weight: 0.50 },
    ],
  },
  FRANKENSTEIN: {
    name: "frankenstein",
    hp: 14,
    damage: 8,
    defense: 3,
    trapDamage: 2,
    criticalChance: 0.1,
    sprite: "frankenstein",
    isAggressive: true,
    isRanged: false,
    damageAoE: 5,
    dropChance: 0.85, // 85% de soltar algo
    lootTable: [
      { key: "DEEP_COIN", weight: 0.01 },
      { key: "CRIT", weight: 0.01 },
      { key: "POTION", weight: 0.35 },
      { key: "KEY_CHEST", weight: 0.08 },
      { key: "PICKAXE", weight: 0.55 },
    ],
  },
  DEVIL: {
    name: "devil",
    hp: 19,
    damage: 11,
    defense: 4,
    criticalChance: 0.15,
    trapDamage: 2,
    sprite: "devil",
    isAggressive: true,
    isRanged: true,
    damageAoE: 8,
    dropChance: 0.9, // 90% de soltar algo
    lootTable: [
      { key: "DEEP_COIN", weight: 0.01 },
      { key: "DEFENSE", weight: 0.01 },
      { key: "ATTACK", weight: 0.01 },
      { key: "CRIT", weight: 0.01 },
      { key: "POTION", weight: 0.25 },
      { key: "KEY_CHEST", weight: 0.08 },
      { key: "PICKAXE", weight: 0.63 },
    ],
  },
};
