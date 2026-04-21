import type { MinigameSessionEconomyMeta } from "lib/portal/types";
import { DD_ITEM } from "./deepDungeonItemIds";

/**
 * Offline dev economy meta — mirrors what the API returns in `session.items`.
 * Key = asset filename (used for image path: world/DeepDungeonAssets/{key}.png).
 * id  = numeric item ID matching DD_ITEM / playerEconomy.balances keys.
 */
export const DEEP_DUNGEON_OFFLINE_ECONOMY_META: MinigameSessionEconomyMeta = {
  items: {
    deep_token:       { name: "Deep Coin",         description: "The dungeon's rare currency.",        id: Number(DD_ITEM.DEEP_COIN) },
    pink_crystal_1:   { name: "Pink Crystal I",    description: "A faint pink crystal.",               id: Number(DD_ITEM.PINK_CRYSTAL_1) },
    pink_crystal_2:   { name: "Pink Crystal II",   description: "A brighter pink crystal.",            id: Number(DD_ITEM.PINK_CRYSTAL_2) },
    pink_crystal_3:   { name: "Pink Crystal III",  description: "A vivid pink crystal.",               id: Number(DD_ITEM.PINK_CRYSTAL_3) },
    pink_crystal_4:   { name: "Pink Crystal IV",   description: "A radiant pink crystal.",             id: Number(DD_ITEM.PINK_CRYSTAL_4) },
    pink_crystal_5:   { name: "Pink Crystal V",    description: "A blazing pink crystal.",             id: Number(DD_ITEM.PINK_CRYSTAL_5) },
    white_crystal_1:  { name: "White Crystal I",   description: "A faint white crystal.",              id: Number(DD_ITEM.WHITE_CRYSTAL_1) },
    white_crystal_2:  { name: "White Crystal II",  description: "A brighter white crystal.",           id: Number(DD_ITEM.WHITE_CRYSTAL_2) },
    white_crystal_3:  { name: "White Crystal III", description: "A vivid white crystal.",              id: Number(DD_ITEM.WHITE_CRYSTAL_3) },
    white_crystal_4:  { name: "White Crystal IV",  description: "A radiant white crystal.",            id: Number(DD_ITEM.WHITE_CRYSTAL_4) },
    white_crystal_5:  { name: "White Crystal V",   description: "A blazing white crystal.",            id: Number(DD_ITEM.WHITE_CRYSTAL_5) },
    blue_crystal_1:   { name: "Blue Crystal I",    description: "A faint blue crystal.",               id: Number(DD_ITEM.BLUE_CRYSTAL_1) },
    blue_crystal_2:   { name: "Blue Crystal II",   description: "A brighter blue crystal.",            id: Number(DD_ITEM.BLUE_CRYSTAL_2) },
    blue_crystal_3:   { name: "Blue Crystal III",  description: "A vivid blue crystal.",               id: Number(DD_ITEM.BLUE_CRYSTAL_3) },
    blue_crystal_4:   { name: "Blue Crystal IV",   description: "A radiant blue crystal.",             id: Number(DD_ITEM.BLUE_CRYSTAL_4) },
    blue_crystal_5:   { name: "Blue Crystal V",    description: "A blazing blue crystal.",             id: Number(DD_ITEM.BLUE_CRYSTAL_5) },
    prismora_crystal_1: { name: "Prismora Crystal I",   description: "A faint prismora crystal.",      id: Number(DD_ITEM.PRISMORA_CRYSTAL_1) },
    prismora_crystal_2: { name: "Prismora Crystal II",  description: "A brighter prismora crystal.",   id: Number(DD_ITEM.PRISMORA_CRYSTAL_2) },
    prismora_crystal_3: { name: "Prismora Crystal III", description: "A vivid prismora crystal.",      id: Number(DD_ITEM.PRISMORA_CRYSTAL_3) },
    prismora_crystal_4: { name: "Prismora Crystal IV",  description: "A radiant prismora crystal.",    id: Number(DD_ITEM.PRISMORA_CRYSTAL_4) },
    prismora_crystal_5: { name: "Prismora Crystal V",   description: "A blazing prismora crystal.",    id: Number(DD_ITEM.PRISMORA_CRYSTAL_5) },
    potion:    { name: "Energy Potion", description: "Restores energy in the dungeon.", id: Number(DD_ITEM.POTION) },
    key_chest: { name: "Chest Key",     description: "Opens chests in the dungeon.",    id: Number(DD_ITEM.KEY_CHEST) },
  },
};
