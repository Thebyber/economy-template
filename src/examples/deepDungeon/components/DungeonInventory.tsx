import React from "react";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";
import { Label } from "components/ui/Label";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import type { DeepDungeonRunStats } from "../DeepDungeonScene";
import type { RunProgress } from "../lib/DeepDungeonRunContext";

const pickaxeImg = "/world/DeepDungeonAssets/pickaxe.png";
const deepTokenImg = "/world/DeepDungeonAssets/deep_token.png";
const skullImg = "/world/DeepDungeonAssets/skull.png";

const ENEMY_ORDER = ["slime", "skeleton", "knight", "frankenstein", "devil"] as const;

interface Props {
  stats: DeepDungeonRunStats;
  progress: RunProgress;
}

export const DungeonInventory: React.FC<Props> = ({ stats, progress }) => {
  const pickaxeCount = stats.inventory.pickaxe ?? 0;
  const crystals = Object.entries(progress.crystals).filter(([, count]) => count > 0);
  const deepCoins = progress.deepCoins ?? 0;
  const enemyKills = ENEMY_ORDER.map((type) => ({
    type,
    count: progress.totalEnemiesByType[type] ?? 0,
  })).filter(({ count }) => count > 0);

  if (pickaxeCount === 0 && crystals.length === 0 && deepCoins === 0 && enemyKills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-70">
        <img src={DD_SUNNYSIDE.icons.basket} className="w-10 mb-2" alt="" />
        <p className="font-bold text-xs text-brown-1100">{"Your basket is empty"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 font-bold ">
      {/* COINS */}
      {deepCoins > 0 && (
        <section>
          <div className="mb-3">
            <Label type="formula" icon={deepTokenImg} className="ml-1 uppercase text-sm">
              {"Coins"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Box image={deepTokenImg} count={new Decimal(deepCoins)} fillImage />
          </div>
        </section>
      )}

      {/* TOOLS */}
      {pickaxeCount > 0 && (
        <section>
          <div className="mb-3">
            <Label type="formula" icon={DD_SUNNYSIDE.icons.hammer} className="ml-1 uppercase text-sm">
              {"Tools"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Box image={pickaxeImg} count={new Decimal(pickaxeCount)} fillImage />
          </div>
        </section>
      )}

      {/* CRYSTALS */}
      {crystals.length > 0 && (
        <section>
          <div className="mb-3">
            <Label type="formula" icon="/world/DeepDungeonAssets/bag_crystal.png" className="ml-1 uppercase text-sm">
              {"Crystals"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {crystals.map(([name, count]) => (
              <Box
                key={name}
                image={`world/DeepDungeonAssets/${name}.png`}
                count={new Decimal(count)}
                fillImage
              />
            ))}
          </div>
        </section>
      )}

      {/* ENEMIES DEFEATED */}
      {enemyKills.length > 0 && (
        <section>
          <div className="mb-3">
            <Label type="formula" icon={skullImg} className="ml-1 uppercase text-sm">
              {"Enemies Defeated"}
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {enemyKills.map(({ type, count }) => (
              <Box
                key={type}
                image={`world/DeepDungeonAssets/${type}s_killed.png`}
                count={new Decimal(count)}
                fillImage
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
