import React from "react";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { ENEMY_TYPES, ENEMY_DEBUT_FLOORS, getScaledEnemyStats, type EnemyType } from "../lib/Enemies";
import {
  getLevelDesign,
  DUNGEON_POINTS,
  CRYSTAL_DROP_TABLE,
  DROP_ITEMS_CONFIG,
} from "../DeepDungeonConstants";
import type { RunProgress } from "../lib/DeepDungeonRunContext";

// ── Item slot card ────────────────────────────────────────────────────────────

interface ItemSlotProps {
  name: string;
  current: number;
  total: number;
  image: string;
  level?: number;
  hp?: number;
  atk?: number;
  def?: number;
  crit?: number;
  damageAoE?: number;
  energyDrops?: { amount: number; chance: number }[];
  lootDrops?: { sprite: string; label: string; chance: number }[];
  dropChance?: number;
  pointsOverride?: number;
  description?: string;
}

const DungeonItemSlot: React.FC<ItemSlotProps> = ({
  name, current, total, image, level,
  hp, atk, def, crit, damageAoE,
  energyDrops, lootDrops, dropChance, pointsOverride, description,
}) => {
  const crystalPoints = DUNGEON_POINTS.CRYSTALS[name as keyof typeof DUNGEON_POINTS.CRYSTALS];
  const enemyPoints = DUNGEON_POINTS.ENEMIES[name.toUpperCase() as keyof typeof DUNGEON_POINTS.ENEMIES];
  const points = pointsOverride ?? crystalPoints ?? enemyPoints ?? 0;
  const isComplete = current >= total;

  return (
    <div className="font-bold flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm relative w-full h-full min-h-[180px]">
      {/* NAME + LEVEL */}
      <div className="w-full flex justify-center items-center gap-1 mb-2 font-bold">
        <span className="text-[12px] font-bold text-brown-1100 text-center leading-tight capitalize">
          {name.replace(/_/g, " ")}
        </span>
        {level !== undefined && (
          <span className="text-[10px] font-bold text-white bg-[#754733] rounded px-1">
            {`Lv.${level}`}
          </span>
        )}
      </div>

      {/* IMAGE */}
      <img
        src={image}
        className="w-10 h-10 object-contain mb-2"
        style={{ imageRendering: "pixelated" }}
        onError={(e) => (e.currentTarget.style.display = "none")}
        alt={name}
      />

      {/* DESCRIPTION */}
      {description && (
        <span className="text-[11px] font-bold text-brown-700 text-center mb-1">{description}</span>
      )}

      {/* ENEMY STATS */}
      {(hp !== undefined || atk !== undefined || def !== undefined || crit !== undefined || (damageAoE !== undefined && damageAoE > 0)) && (
        <div className="w-full border-t border-brown-600/20 pt-2 flex flex-wrap justify-center gap-x-3 gap-y-2 mb-2">
          {hp !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-red-1100">{hp}</span>
              <img src="world/DeepDungeonAssets/heart.png" className="w-6 h-6" alt="HP" />
            </div>
          )}
          {atk !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-orange-1100">{atk}</span>
              <img src="world/DeepDungeonAssets/sword.png" className="w-6 h-6" alt="ATK" />
            </div>
          )}
          {def !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-blue-1100">{def}</span>
              <img src="world/DeepDungeonAssets/shield.png" className="w-6 h-6" alt="DEF" />
            </div>
          )}
          {crit !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-purple-1100">
                {Math.round(crit)}{"%" }
              </span>
              <img src="world/DeepDungeonAssets/crit.png" className="w-6 h-6" alt="CRIT" />
            </div>
          )}
          {damageAoE !== undefined && damageAoE > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-bold text-orange-1100">{damageAoE}</span>
              <img src="world/DeepDungeonAssets/AoEatq.png" className="w-6 h-6" alt="AoE" />
            </div>
          )}
        </div>
      )}

      {/* POINTS */}
      {points > 0 && (
        <div className="text-[12px] font-bold text-green-700 mb-1">
          {`${points} Points`}
        </div>
      )}

      {/* LOOT DROPS */}
      {lootDrops && lootDrops.length > 0 && (
        <div className="w-full border-t border-brown-1100/20 pt-1 mt-1">
          <div className="flex items-center gap-1 justify-center mb-1 font-bold">
            <img src="/world/DeepDungeonAssets/random.png" className="w-6 h-6" alt="drops" />
            <span className="text-[12px] font-bold text-brown-1100 uppercase">
              {dropChance !== undefined ? `${Math.round(dropChance * 100)}% drop` : "Drops"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {lootDrops.map((drop) => (
              <div key={drop.label} className="flex items-center gap-1 justify-between px-1">
                <div className="flex items-center gap-0.5">
                  <img
                    src={`world/DeepDungeonAssets/${drop.sprite}.png`}
                    className="w-6 h-6"
                    style={{ imageRendering: "pixelated" }}
                    alt={drop.sprite}
                  />
                  <span className="text-[12px] font-bold text-brown-1100">{drop.label}</span>
                </div>
                <span className="text-[12px] font-bold text-green-1100">{drop.chance}{"%"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENERGY DROPS */}
      {energyDrops && energyDrops.length > 0 && (
        <div className="w-full border-t border-brown-1100/20 pt-1 mt-1">
          <div className="flex items-center gap-1 justify-center mb-1">
            <img src="/world/DeepDungeonAssets/random.png" className="w-6 h-6" alt="energy" />
            <span className="text-[12px] font-bold text-brown-1100 uppercase">{"Drops"}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {energyDrops.map((drop) => (
              <div key={drop.amount} className="flex items-center gap-1 justify-between px-1">
                <div className="flex items-center gap-0.5">
                  <img src={DD_SUNNYSIDE.icons.lightning} className="w-6 h-6" alt="energy" />
                  <span className="text-[12px] font-bold text-brown-1100">{`+${drop.amount} Energy`}</span>
                </div>
                <span className="text-[12px] font-bold text-green-1100">{drop.chance}{"%"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS */}
      <div className="font-bold flex items-center gap-1 mt-auto w-full justify-center bg-brown-200/40 rounded-sm py-1">
        <span className={`text-[12px] font-bold ${isComplete ? "text-green-1100" : "text-brown-700"}`}>
          {`${current}/${total}`}
        </span>
        {isComplete && (
          <img src={DD_SUNNYSIDE.icons.confirm} className="w-6" alt="ok" />
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  category: "Enemies" | "Crystals" | "Chests";
  progress: RunProgress;
}

export const DungeonProgress: React.FC<Props> = ({ category, progress }) => {
  const currentLevel = progress.currentLevel;
  const levelData = getLevelDesign(currentLevel);

  return (
    <InnerPanel className="flex flex-col h-full overflow-y-auto scrollable p-2 font-bold">
      <div className="space-y-3 text-sm">
        <Label
          type="default"
          icon={
            category === "Enemies"
              ? "/world/DeepDungeonAssets/skull.png"
              : category === "Crystals"
              ? "/world/DeepDungeonAssets/bag_crystal.png"
              : "/world/DeepDungeonAssets/chest.png"
          }
        >
          {`${category} - Map ${currentLevel}`}
        </Label>

        <div className="grid grid-cols-2 gap-2">
          {category === "Enemies" &&
            levelData.enemies.map((enemy) => {
              const enemyType = enemy.type.toUpperCase() as EnemyType;
              const baseStats = ENEMY_TYPES[enemyType];
              const scaledStats = getScaledEnemyStats(enemyType, currentLevel);
              const debutFloor = ENEMY_DEBUT_FLOORS[enemyType];
              const enemyLevel = Math.max(1, Math.floor((currentLevel - debutFloor) / 2) + 1);
              const typeKey = enemy.type.toLowerCase();
              const currentCount = progress.enemies[typeKey] ?? 0;

              let lootDrops: { sprite: string; label: string; chance: number }[] | undefined;
              if (baseStats?.lootTable?.length) {
                const totalWeight = baseStats.lootTable.reduce((s, d) => s + d.weight, 0);
                lootDrops = baseStats.lootTable.map((d) => {
                  const cfg = DROP_ITEMS_CONFIG[d.key];
                  return {
                    sprite: cfg?.sprite ?? d.key.toLowerCase(),
                    label: cfg?.label ?? d.key,
                    chance: Math.round(baseStats.dropChance * (d.weight / totalWeight) * 100),
                  };
                });
              }

              return (
                <DungeonItemSlot
                  key={`${currentLevel}-${typeKey}`}
                  name={scaledStats?.name || enemy.type}
                  current={currentCount}
                  total={enemy.count}
                  image={`world/DeepDungeonAssets/${typeKey}.png`}
                  level={enemyLevel}
                  hp={scaledStats?.hp}
                  atk={scaledStats?.damage}
                  damageAoE={scaledStats?.damageAoE}
                  def={scaledStats?.defense}
                  crit={Math.round((scaledStats?.criticalChance ?? 0) * 100)}
                  lootDrops={lootDrops}
                  dropChance={baseStats?.dropChance}
                />
              );
            })}

          {category === "Chests" && (() => {
            return (
              <div className="col-span-2 flex justify-center">
                <div className="w-1/2">
                  <DungeonItemSlot
                    name="Chest"
                    current={progress.levelChestsOpened > 0 ? 1 : 0}
                    total={1}
                    image="/world/DeepDungeonAssets/chest.png"
                    pointsOverride={DUNGEON_POINTS.CHEST_OPEN}
                    description="Requires 1 key to open"
                    lootDrops={[
                      { sprite: "potion",     label: "+1 Potion",    chance: 100 },
                      { sprite: "sword",      label: "+1 Attack",    chance: 25 },
                      { sprite: "shield",     label: "+1 Defense",   chance: 25 },
                      { sprite: "crit",       label: "+2% Critical Chance", chance: 25 },
                      { sprite: "sword",      label: "+2 Attack",           chance: 7  },
                      { sprite: "shield",     label: "+2 Defense",          chance: 7  },
                      { sprite: "crit",       label: "+5% Critical Chance", chance: 7  },
                      { sprite: "deep_token", label: "+1 Deep Coin", chance: 4  },
                    ]}
                  />
                </div>
              </div>
            );
          })()}

          {category === "Crystals" &&
            levelData.crystals.map((c) => {
              const itemKey = `${c.type}_crystal_${c.level}`;
              const dropTable = CRYSTAL_DROP_TABLE[itemKey];
              let energyDrops: { amount: number; chance: number }[] | undefined;

              if (dropTable) {
                const totalWeight = dropTable.energyDrops.reduce((s, d) => s + d.weight, 0);
                energyDrops = dropTable.energyDrops.map((d) => ({
                  amount: d.amount,
                  chance: Math.round((d.weight / totalWeight) * 100),
                }));
              }

              return (
                <DungeonItemSlot
                  key={`${currentLevel}-${itemKey}`}
                  name={itemKey}
                  current={progress.levelCrystals[itemKey] ?? 0}
                  total={c.count}
                  image={`world/DeepDungeonAssets/${itemKey}.png`}
                  energyDrops={energyDrops}
                />
              );
            })}
        </div>
      </div>
    </InnerPanel>
  );
};
