/**
 * Numeric item IDs as configured in the Deep Dungeon economy dashboard.
 * All IDs are string keys matching `playerEconomy.balances`.
 */
export const DD_ITEM = {
  // ── Economy ──────────────────────────────────────────────
  DEEP_COIN: "0",
  ATTEMPTS: "1",

  // ── Crystals (5 tiers each) ───────────────────────────────
  PINK_CRYSTAL_1: "2",
  PINK_CRYSTAL_2: "3",
  PINK_CRYSTAL_3: "4",
  PINK_CRYSTAL_4: "5",
  PINK_CRYSTAL_5: "6",

  WHITE_CRYSTAL_1: "7",
  WHITE_CRYSTAL_2: "8",
  WHITE_CRYSTAL_3: "9",
  WHITE_CRYSTAL_4: "10",
  WHITE_CRYSTAL_5: "11",

  BLUE_CRYSTAL_1: "12",
  BLUE_CRYSTAL_2: "13",
  BLUE_CRYSTAL_3: "14",
  BLUE_CRYSTAL_4: "15",
  BLUE_CRYSTAL_5: "16",

  PRISMORA_CRYSTAL_1: "17",
  PRISMORA_CRYSTAL_2: "18",
  PRISMORA_CRYSTAL_3: "19",
  PRISMORA_CRYSTAL_4: "20",
  PRISMORA_CRYSTAL_5: "21",

  // ── Lifetime stats ────────────────────────────────────────
  DUNGEON_LEVEL_REACHED: "22",
  ENEMIES_KILLED: "23",
  SLIMES_KILLED: "24",
  SKELETONS_KILLED: "25",
  KNIGHTS_KILLED: "26",
  FRANKENSTEINS_KILLED: "27",
  DEVILS_KILLED: "28",
  CRYSTALS_MINED: "29",

  // ── Score / XP ────────────────────────────────────────────
  SCORE: "30",
  PLAYER_XP: "31",

  // ── Trophies — enemies (general) ─────────────────────────
  TROPHY_ENEMIES_BRONZE: "32",
  TROPHY_ENEMIES_SILVER: "33",
  TROPHY_ENEMIES_GOLD: "34",
  TROPHY_ENEMIES_EMERALD: "35",
  TROPHY_ENEMIES_DIAMOND: "36",

  // ── Trophies — slime ──────────────────────────────────────
  TROPHY_SLIME_BRONZE: "37",
  TROPHY_SLIME_SILVER: "38",
  TROPHY_SLIME_GOLD: "39",
  TROPHY_SLIME_EMERALD: "40",
  TROPHY_SLIME_DIAMOND: "41",

  // ── Trophies — skeleton ───────────────────────────────────
  TROPHY_SKELETON_BRONZE: "42",
  TROPHY_SKELETON_SILVER: "43",
  TROPHY_SKELETON_GOLD: "44",
  TROPHY_SKELETON_EMERALD: "45",
  TROPHY_SKELETON_DIAMOND: "46",

  // ── Trophies — knight ─────────────────────────────────────
  TROPHY_KNIGHT_BRONZE: "47",
  TROPHY_KNIGHT_SILVER: "48",
  TROPHY_KNIGHT_GOLD: "49",
  TROPHY_KNIGHT_EMERALD: "50",
  TROPHY_KNIGHT_DIAMOND: "51",

  // ── Trophies — frankenstein ───────────────────────────────
  TROPHY_FRANKENSTEIN_BRONZE: "52",
  TROPHY_FRANKENSTEIN_SILVER: "53",
  TROPHY_FRANKENSTEIN_GOLD: "54",
  TROPHY_FRANKENSTEIN_EMERALD: "55",
  TROPHY_FRANKENSTEIN_DIAMOND: "56",

  // ── Trophies — devil ──────────────────────────────────────
  TROPHY_DEVIL_BRONZE: "57",
  TROPHY_DEVIL_SILVER: "58",
  TROPHY_DEVIL_GOLD: "59",
  TROPHY_DEVIL_EMERALD: "60",
  TROPHY_DEVIL_DIAMOND: "61",

  // ── Trophies — crystal ────────────────────────────────────
  TROPHY_CRYSTAL_BRONZE: "62",
  TROPHY_CRYSTAL_SILVER: "63",
  TROPHY_CRYSTAL_GOLD: "64",
  TROPHY_CRYSTAL_EMERALD: "65",
  TROPHY_CRYSTAL_DIAMOND: "66",

  // ── Trophies — lightning ──────────────────────────────────
  TROPHY_LIGHTNING_BRONZE: "67",
  TROPHY_LIGHTNING_SILVER: "68",
  TROPHY_LIGHTNING_GOLD: "69",
  TROPHY_LIGHTNING_EMERALD: "70",
  TROPHY_LIGHTNING_DIAMOND: "71",

  // ── Trophies — sword ──────────────────────────────────────
  TROPHY_SWORD_BRONZE: "72",
  TROPHY_SWORD_SILVER: "73",
  TROPHY_SWORD_GOLD: "74",
  TROPHY_SWORD_EMERALD: "75",
  TROPHY_SWORD_DIAMOND: "76",

  // ── Trophies — shield ─────────────────────────────────────
  TROPHY_SHIELD_BRONZE: "77",
  TROPHY_SHIELD_SILVER: "78",
  TROPHY_SHIELD_GOLD: "79",
  TROPHY_SHIELD_EMERALD: "80",
  TROPHY_SHIELD_DIAMOND: "81",

  // ── Trophies — critical ───────────────────────────────────
  TROPHY_CRITICAL_BRONZE: "82",
  TROPHY_CRITICAL_SILVER: "83",
  TROPHY_CRITICAL_GOLD: "84",
  TROPHY_CRITICAL_EMERALD: "85",
  TROPHY_CRITICAL_DIAMOND: "86",

  // ── Trophies — deepcoin (comprados con deep_coin) ─────────
  TROPHY_DEEPCOIN_BRONZE: "87",
  TROPHY_DEEPCOIN_SILVER: "88",
  TROPHY_DEEPCOIN_GOLD: "89",
  TROPHY_DEEPCOIN_EMERALD: "90",
  TROPHY_DEEPCOIN_DIAMOND: "91",
} as const;

export type DdItemId = (typeof DD_ITEM)[keyof typeof DD_ITEM];

/** Internal run token — minted on START_GAME, burned on GAMEOVER. */
export const DD_ACTIVE_RUN_KEY = "ACTIVE_RUN";
