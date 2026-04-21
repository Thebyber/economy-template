import React, { useState } from "react";
import { InnerPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import {
  DROP_ITEMS_CONFIG,
  CRYSTAL_DROP_TABLE,
  DUNGEON_POINTS,
} from "../DeepDungeonConstants";
import { ENEMY_TYPES } from "../lib/Enemies";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CRYSTAL_COLORS = ["pink", "white", "blue", "prismora"] as const;
const CRYSTAL_COLOR_LABELS: Record<string, string> = {
  pink: "Pink",
  white: "White",
  blue: "Blue",
  prismora: "Prismora",
};

// ── Stat badge ───────────────────────────────────────────────────────────────

const StatBadge: React.FC<{ value: number | string; icon: string; color: string }> = ({
  value, icon, color,
}) => (
  <div className="flex items-center gap-0.5">
    <span className={`text-[12px] font-bold ${color}`}>{value}</span>
    <img src={icon} className="w-6 h-6" style={{ imageRendering: "pixelated" }} alt="" />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const CHEST_DROP_TABLE = [
  { label: "+1 Potion",    icon: "potion",     chance: 100 },
  { label: "+1 Attack",    icon: "sword",      chance: 25 },
  { label: "+1 Defense",   icon: "shield",     chance: 25 },
  { label: "+2% Critical Chance", icon: "crit",  chance: 25 },
  { label: "+2 Attack",    icon: "sword",      chance: 7  },
  { label: "+2 Defense",   icon: "shield",     chance: 7  },
  { label: "+5% Critical Chance", icon: "crit", chance: 7 },
  { label: "+1 Deep Coin", icon: "deep_token", chance: 4  },
];

export const DungeonDrops: React.FC = () => {
  const [tab, setTab] = useState<"enemies" | "crystals" | "chests">("enemies");

  return (
    <InnerPanel className="flex flex-col h-full p-2">
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <button
          className={`font-bold text-[12px] uppercase px-2 py-1 rounded-sm border transition-colors ${
            tab === "enemies"
              ? "bg-[#ead4aa] border-[#754733] text-brown-1100"
              : "bg-transparent border-transparent text-brown-1100 hover:text-brown-800"
          }`}
          onClick={() => setTab("enemies")}
        >
          <div className="font-bold flex items-center gap-1">
            <img src="/world/DeepDungeonAssets/skull.png" className="w-6 h-6" alt="" />
            {"Enemies"}
          </div>
        </button>
        <button
          className={`font-bold text-[12px] uppercase px-2 py-1 rounded-sm border transition-colors ${
            tab === "crystals"
              ? "bg-[#ead4aa] border-[#754733] text-brown-1100"
              : "bg-transparent border-transparent text-brown-1100 hover:text-brown-1100"
          }`}
          onClick={() => setTab("crystals")}
        >
          <div className="flex items-center gap-1">
            <img src="/world/DeepDungeonAssets/bag_crystal.png" className="w-6 h-6" alt="" />
            {"Crystals"}
          </div>
        </button>
        <button
          className={`font-bold text-[12px] uppercase px-2 py-1 rounded-sm border transition-colors ${
            tab === "chests"
              ? "bg-[#ead4aa] border-[#754733] text-brown-1100"
              : "bg-transparent border-transparent text-brown-1100 hover:text-brown-1100"
          }`}
          onClick={() => setTab("chests")}
        >
          <div className="flex items-center gap-1">
            <img src="/world/DeepDungeonAssets/chest.png" className="w-6 h-6" alt="" />
            {"Chests"}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollable pr-1 space-y-3 font-bold">

        {/* ── ENEMIES ── */}
        {tab === "enemies" && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ENEMY_TYPES).map(([key, config]) => {
              const points = DUNGEON_POINTS.ENEMIES[key as keyof typeof DUNGEON_POINTS.ENEMIES] ?? 0;
              const totalWeight = config.lootTable.reduce((s, d) => s + d.weight, 0);

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm"
                >
                  {/* Name */}
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[12px] font-bold text-brown-1100 uppercase text-center">
                      {config.name}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-[#754733] rounded px-1">
                      {"Lv.1"}
                    </span>
                  </div>

                  {/* Image */}
                  <img
                    src={`world/DeepDungeonAssets/${config.sprite}.png`}
                    className="w-10 h-10 object-contain mb-2"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    alt={config.name}
                  />

                  {/* Stats */}
                  <div className="w-full border-t border-brown-1100/20 pt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
                    <StatBadge value={config.hp} icon="world/DeepDungeonAssets/heart.png" color="text-red-1100" />
                    <StatBadge value={config.damage} icon="world/DeepDungeonAssets/sword.png" color="text-orange-1100" />
                    <StatBadge value={config.defense} icon="world/DeepDungeonAssets/shield.png" color="text-blue-1100" />
                    {config.criticalChance !== undefined && (
                      <StatBadge
                        value={`${Math.round(config.criticalChance * 100)}%`}
                        icon="world/DeepDungeonAssets/crit.png"
                        color="text-purple-1100"
                      />
                    )}
                    {config.damageAoE > 0 && (
                      <StatBadge value={config.damageAoE} icon="world/DeepDungeonAssets/AoEatq.png" color="text-orange-1100" />
                    )}
                  </div>

                  {/* Points */}
                  {points > 0 && (
                    <div className="text-[12px] font-bold text-green-1100 mb-1">
                      {points}{" Points"}
                    </div>
                  )}

                  {/* Drops */}
                  <div className="w-full border-t border-brown-1100/20 pt-1 mt-1 font-bold">
                    <div className="flex items-center gap-1 justify-center mb-1 font-bold">
                      <img src="/world/DeepDungeonAssets/random.png" className="w-6 h-6" alt="drop" />
                      <span className="text-[12px] font-bold text-brown-700 uppercase font-bold">
                        {config.dropChance * 100}{"% Drop"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 font-bold">
                      {config.lootTable.map((loot) => {
                        const info = DROP_ITEMS_CONFIG[loot.key as keyof typeof DROP_ITEMS_CONFIG];
                        const chance = Math.round(config.dropChance * (loot.weight / totalWeight) * 100);
                        return (
                          <div key={loot.key} className="flex items-center gap-1 justify-between px-1">
                            <div className="flex items-center gap-0.5">
                              <img
                                src={`world/DeepDungeonAssets/${info?.sprite ?? loot.key.toLowerCase()}.png`}
                                className="w-6 h-6"
                                style={{ imageRendering: "pixelated" }}
                                alt={loot.key}
                              />
                              <span className="text-[12px] font-bold text-brown-1100">{info?.label ?? loot.key}</span>
                            </div>
                            <span className="text-[12px] font-bold text-green-1100">{chance}{"%"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CRYSTALS ── */}
        {tab === "crystals" &&
          CRYSTAL_COLORS.map((color) => (
            <div key={color}>
              <Label type="default" className="mb-2 font-bold uppercase text-sm">
                {CRYSTAL_COLOR_LABELS[color]}{" Crystals"}
              </Label>

              <div className="grid grid-cols-2 gap-2 mb-3 font-bold">
                {[1, 2, 3, 4, 5].map((level) => {
                  const key = `${color}_crystal_${level}`;
                  const dropTable = CRYSTAL_DROP_TABLE[key];
                  const points = DUNGEON_POINTS.CRYSTALS[key as keyof typeof DUNGEON_POINTS.CRYSTALS] ?? 0;

                  if (!dropTable) return null;

                  const totalWeight = dropTable.energyDrops.reduce((s, d) => s + d.weight, 0);

                  return (
                    <div
                      key={key}
                      className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-2 rounded-sm"
                    >
                      {/* Name */}
                      <span className="text-[12px] font-bold text-brown-1100 uppercase text-center mb-1">
                        {`${CRYSTAL_COLOR_LABELS[color]} Crystal ${level}`}
                      </span>

                      {/* Image */}
                      <img
                        src={`world/DeepDungeonAssets/${key}.png`}
                        className="w-10 h-10 object-contain mb-2"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        alt={key}
                      />

                      {/* Points */}
                      {points > 0 && (
                        <div className="text-[12px] font-bold text-green-1100 mb-1">
                          {points}{" Points"}
                        </div>
                      )}

                      {/* Energy drops */}
                      <div className="w-full border-t border-brown-1100/20 pt-1 mt-1">
                        <div className="flex items-center gap-1 justify-center mb-1">
                          <img src="/world/DeepDungeonAssets/random.png" className="w-6 h-6" alt="energy" />
                          <span className="text-[12px] font-bold text-brown-1100 uppercase">{"Drops"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {dropTable.energyDrops.map((drop) => (
                            <div key={drop.amount} className="flex items-center gap-1 justify-between px-1">
                              <div className="flex items-center gap-0.5">
                                <img src={DD_SUNNYSIDE.icons.lightning} className="w-6 h-6" alt="energy" />
                                <span className="text-[12px] font-bold text-brown-1100">{`+${drop.amount} Energy`}</span>
                              </div>
                              <span className="text-[12px] font-bold text-green-1100">
                                {Math.round((drop.weight / totalWeight) * 100)}{"%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        {/* ── CHESTS ── */}
        {tab === "chests" && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center bg-[#ead4aa] border border-[#754733] p-3 rounded-sm w-full">
              {/* Header */}
              <img
                src="/world/DeepDungeonAssets/chest.png"
                className="w-12 h-12 mb-2"
                style={{ imageRendering: "pixelated" }}
                alt="chest"
              />
              <span className="text-[12px] font-bold text-brown-1100 uppercase mb-1">{"Chest"}</span>
              <span className="text-[12px] font-bold text-brown-700 mb-2 text-center">
                {"Requires 1 key to open"}
              </span>

              {/* Points reward */}
              <div className="text-[13px] font-bold text-green-1100 mb-3">
                {DUNGEON_POINTS.CHEST_OPEN}{" Points on open"}
              </div>

              {/* Drop table */}
              <div className="w-full border-t border-brown-1100/20 pt-2">
                <div className="flex items-center gap-1 justify-center mb-2">
                  <img src="/world/DeepDungeonAssets/random.png" className="w-6 h-6" alt="drop" />
                  <span className="text-[12px] font-bold text-brown-700 uppercase">{"Drop Table"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {CHEST_DROP_TABLE.map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-1">
                        <img
                          src={`/world/DeepDungeonAssets/${row.icon}.png`}
                          className="w-6 h-6"
                          style={{ imageRendering: "pixelated" }}
                          alt={row.label}
                        />
                        <span className="text-[12px] font-bold text-brown-1100">{row.label}</span>
                      </div>
                      <span className="text-[12px] font-bold text-green-1100">{row.chance}{"%"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InnerPanel>
  );
};
