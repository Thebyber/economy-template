import React, { useState } from "react";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";
import { Label } from "components/ui/Label";
import { OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { DUNGEON_POINTS, INVENTORY_CAPS, POTION_RESTORE } from "../DeepDungeonConstants";
import type { DeepDungeonRunStats } from "../DeepDungeonScene";
import type { RunProgress } from "../lib/DeepDungeonRunContext";

const pickaxeImg = "/world/DeepDungeonAssets/pickaxe.png";
const potionImg = "/world/DeepDungeonAssets/potion.png";
const keyChestImg = "/world/DeepDungeonAssets/key_chest.png";
const chestOpenImg = "/world/DeepDungeonAssets/chest_open.png";
const deepTokenImg = "/world/DeepDungeonAssets/deep_token.png";
const skullImg = "/world/DeepDungeonAssets/skull.png";

const ENEMY_ORDER = ["slime", "skeleton", "knight", "frankenstein", "devil"] as const;

interface ItemDetail {
  id: string;
  image: string;
  name: string;
  description: string;
  count: number;
}

// ── Item definitions ──────────────────────────────────────────────────────────

const TOOL_DETAILS: Record<string, { name: string; description: string }> = {
  pickaxe: {
    name: "Pickaxe",
    description: `Used to mine crystals. Max ${INVENTORY_CAPS.pickaxe}.`,
  },
  potion: {
    name: "Energy Potion",
    description: `Restores a burst of energy. Use it wisely when running low. Max ${INVENTORY_CAPS.potion}.`,
  },
  key_chest: {
    name: "Chest Key",
    description: `Opens chests hidden in the dungeon. Contains random stat bonuses. Max ${INVENTORY_CAPS.key_chest}.`,
  },
  chest_open: {
    name: "Chests Opened",
    description: "Total chests opened during this run.",
  },
};

const ENEMY_DETAILS: Record<string, { name: string; description: string }> = {
  slime:        { name: "Slimes defeated",        description: "Used to unlock trophies." },
  skeleton:     { name: "Skeletons defeated",     description: "Used to unlock trophies." },
  knight:       { name: "Knight defeated",       description: "Used to unlock trophies." },
  frankenstein: { name: "Frankenstein defeated", description: "Used to unlock trophies." },
  devil:        { name: "Devil defeated",        description: "Used to unlock trophies." },
};

function crystalDisplayName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Detail panel ──────────────────────────────────────────────────────────────

const ItemDetailPanel: React.FC<{
  item: ItemDetail | null;
  onUsePotion: () => boolean;
}> = ({ item, onUsePotion }) => {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
        <img src={DD_SUNNYSIDE.icons.basket} className="w-8" alt="" />
        <p className="text-xs font-bold text-brown-1100 text-center">{"Select an item"}</p>
      </div>
    );
  }

  const isPotion = item.id === "potion";

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      <p className="font-bold text-sm text-brown-1100 text-center">{item.name}</p>
      <div
        className="flex items-center justify-center bg-brown-600 rounded"
        style={{ width: 56, height: 56, border: "2px solid #754733" }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-[80%] h-[80%] object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <p className="text-xs font-bold text-brown-1100 text-center leading-relaxed px-1">
        {item.description}
      </p>
      <Label type="formula" className="mt-1">
        {`x${item.count}`}
      </Label>
      {isPotion && item.count > 0 && (
        <Button
          className="w-full mt-1"
          onClick={onUsePotion}
        >
          {`Use (+${POTION_RESTORE} energy)`}
        </Button>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  stats: DeepDungeonRunStats;
  progress: RunProgress;
  onUsePotion: () => boolean;
}

export const DungeonInventory: React.FC<Props> = ({ stats, progress, onUsePotion }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);

  const pickaxeCount = stats.inventory.pickaxe ?? 0;
  const potionCount = stats.inventory.potion ?? 0;
  const keyChestCount = stats.inventory.key_chest ?? 0;
  const chestsOpenedCount = progress.chestsOpened ?? 0;
  const crystals = Object.entries(progress.crystals).filter(([, count]) => count > 0);
  const deepCoins = progress.deepCoins ?? 0;
  const enemyKills = ENEMY_ORDER.map((type) => ({
    type,
    count: progress.totalEnemiesByType[type] ?? 0,
  })).filter(({ count }) => count > 0);

  const isEmpty =
    pickaxeCount === 0 && potionCount === 0 && keyChestCount === 0 &&
    chestsOpenedCount === 0 && crystals.length === 0 && deepCoins === 0 && enemyKills.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-70">
        <img src={DD_SUNNYSIDE.icons.basket} className="w-10 mb-2" alt="" />
        <p className="font-bold text-xs text-brown-1100">{"Your basket is empty"}</p>
      </div>
    );
  }

  const select = (id: string, item: ItemDetail) => {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedItem(null);
    } else {
      setSelectedId(id);
      setSelectedItem(item);
    }
  };

  return (
    <div className="flex h-full gap-2">
      {/* ── Left: item grid ── */}
      <div className="flex-1 overflow-y-auto scrollable space-y-4 pr-1">

        {/* COINS */}
        {deepCoins > 0 && (
          <section>
            <Label type="formula" icon={deepTokenImg} className="ml-1 uppercase text-xs mb-2">
              {"Coins"}
            </Label>
            <div className="flex flex-wrap">
              <Box
                image={deepTokenImg}
                count={new Decimal(deepCoins)}
                fillImage
                isSelected={selectedId === "deep_coin"}
                onClick={() => select("deep_coin", {
                  id: "deep_coin",
                  image: deepTokenImg,
                  name: "Deep Coin",
                  description: "The dungeon's rare currency. Earned in battle or traded on the market.",
                  count: deepCoins,
                })}
              />
            </div>
          </section>
        )}

        {/* TOOLS */}
        {(pickaxeCount > 0 || potionCount > 0 || keyChestCount > 0 || chestsOpenedCount > 0) && (
          <section>
            <Label type="formula" icon={DD_SUNNYSIDE.icons.hammer} className="ml-1 uppercase text-xs mb-2">
              {"Tools"}
            </Label>
            <div className="flex flex-wrap">
              {pickaxeCount > 0 && (
                <Box
                  image={pickaxeImg}
                  count={new Decimal(pickaxeCount)}
                  fillImage
                  isSelected={selectedId === "pickaxe"}
                  onClick={() => select("pickaxe", {
                    id: "pickaxe",
                    image: pickaxeImg,
                    name: TOOL_DETAILS.pickaxe.name,
                    description: TOOL_DETAILS.pickaxe.description,
                    count: pickaxeCount,
                  })}
                />
              )}
              {potionCount > 0 && (
                <Box
                  image={potionImg}
                  count={new Decimal(potionCount)}
                  fillImage
                  isSelected={selectedId === "potion"}
                  onClick={() => select("potion", {
                    id: "potion",
                    image: potionImg,
                    name: TOOL_DETAILS.potion.name,
                    description: TOOL_DETAILS.potion.description,
                    count: potionCount,
                  })}
                />
              )}
              {keyChestCount > 0 && (
                <Box
                  image={keyChestImg}
                  count={new Decimal(keyChestCount)}
                  fillImage
                  isSelected={selectedId === "key_chest"}
                  onClick={() => select("key_chest", {
                    id: "key_chest",
                    image: keyChestImg,
                    name: TOOL_DETAILS.key_chest.name,
                    description: TOOL_DETAILS.key_chest.description,
                    count: keyChestCount,
                  })}
                />
              )}
              {chestsOpenedCount > 0 && (
                <Box
                  image={chestOpenImg}
                  count={new Decimal(chestsOpenedCount)}
                  fillImage
                  isSelected={selectedId === "chest_open"}
                  onClick={() => select("chest_open", {
                    id: "chest_open",
                    image: chestOpenImg,
                    name: TOOL_DETAILS.chest_open.name,
                    description: TOOL_DETAILS.chest_open.description,
                    count: chestsOpenedCount,
                  })}
                />
              )}
            </div>
          </section>
        )}

        {/* CRYSTALS */}
        {crystals.length > 0 && (
          <section>
            <Label type="formula" icon="/world/DeepDungeonAssets/bag_crystal.png" className="ml-1 uppercase text-xs mb-2">
              {"Crystals"}
            </Label>
            <div className="flex flex-wrap">
              {crystals.map(([name, count]) => (
                <Box
                  key={name}
                  image={`world/DeepDungeonAssets/${name}.png`}
                  count={new Decimal(count)}
                  fillImage
                  isSelected={selectedId === name}
                  onClick={() => select(name, {
                    id: name,
                    image: `world/DeepDungeonAssets/${name}.png`,
                    name: crystalDisplayName(name),
                    description: `Used to unlock trophies.`,
                    count,
                  })}
                />
              ))}
            </div>
          </section>
        )}

        {/* ENEMIES DEFEATED */}
        {enemyKills.length > 0 && (
          <section>
            <Label type="formula" icon={skullImg} className="ml-1 uppercase text-xs mb-2">
              {"Enemies Defeated"}
            </Label>
            <div className="flex flex-wrap">
              {enemyKills.map(({ type, count }) => (
                <Box
                  key={type}
                  image={`world/DeepDungeonAssets/${type}s_killed.png`}
                  count={new Decimal(count)}
                  fillImage
                  isSelected={selectedId === type}
                  onClick={() => select(type, {
                    id: type,
                    image: `world/DeepDungeonAssets/${type}s_killed.png`,
                    name: ENEMY_DETAILS[type]?.name ?? type,
                    description: ENEMY_DETAILS[type]?.description ?? "",
                    count,
                  })}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Right: detail panel ── */}
      <OuterPanel className="w-[40%] flex-shrink-0 self-start bg-[#f3d28a] border-2 border-[#754733] flex flex-col">
        <ItemDetailPanel item={selectedItem} onUsePotion={onUsePotion} />
      </OuterPanel>
    </div>
  );
};
