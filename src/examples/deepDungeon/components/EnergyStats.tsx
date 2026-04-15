import React from "react";
import { PIXEL_SCALE } from "lib/constants";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { ResizableBar } from "components/ui/ProgressBar";
import { InnerPanel } from "components/ui/Panel";
import type { DeepDungeonRunStats } from "../DeepDungeonScene";

const swordIcon = "/world/DeepDungeonAssets/sword.png";
const shieldIcon = "/world/DeepDungeonAssets/shield.png";
const critIcon = "/world/DeepDungeonAssets/crit.png";
const bagCrystalIcon = "/world/DeepDungeonAssets/bag_crystal.png";
const skullIcon = "/world/DeepDungeonAssets/skull.png";
const mapIcon = "world/DeepDungeonAssets/map_2.webp"

interface Props {
  stats: DeepDungeonRunStats;
  enemiesKilled: number;
  crystalsMined: number;
  score: number;
}

export const EnergyStats: React.FC<Props> = ({ stats, enemiesKilled, crystalsMined, score }) => {
  const { energy, maxEnergy, attack, defense, criticalChance, currentLevel } = stats;
  const percentage = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  let barColor = "#22c55e";
  if (percentage <= 20) barColor = "#ef4444";
  else if (percentage <= 50) barColor = "#facc15";

  const critDisplay = criticalChance >= 1
    ? `${Math.round(criticalChance)}%`
    : `${Math.round(criticalChance * 100)}%`;

  return (
    <div className="flex flex-col items-start">
      <InnerPanel
        className="flex flex-col p-2"
        style={{
          width: `${PIXEL_SCALE * 90}px`,
          background: "rgba(180, 120, 60, 0.55)",
        }}
      >
        {/* ENERGY BAR */}
        <div className="flex items-center gap-2">
          <img
            src={DD_SUNNYSIDE.icons.lightning}
            style={{ width: `${PIXEL_SCALE * 10}px` }}
            alt="Energy"
          />
          <div className="relative flex-grow flex items-center justify-center">
            <div className="w-full custom-energy-bar">
              <ResizableBar
                percentage={percentage}
                type="progress"
                outerDimensions={{ width: 70, height: 12 }}
              />
            </div>
            <style>{`.custom-energy-bar [role="progressbar"] > div { background-color: ${barColor} !important; transition: width 0.3s ease; }`}</style>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-white font-bold shadow-text"
                style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
              >
                {`${Math.floor(energy)}/${maxEnergy}`}
              </span>
            </div>
          </div>
        </div>

        {/* COMBAT STATS */}
        <div className="flex justify-between items-center mt-1 px-1 font-bold">
          <StatItem value={attack} icon={swordIcon} />
          <StatItem value={defense} icon={shieldIcon} />
          <StatItem value={critDisplay} icon={critIcon} />
        </div>

        {/* DIVIDER */}
        <div
          className="mt-1"
          style={{ borderTop: "2px solid rgba(255,255,255,0.4)" }}
        />

        {/* MAP + KILLS + CRYSTALS */}
        <div className="flex justify-between items-center mt-1 px-1">
          <StatItem value={`${currentLevel}`} icon={mapIcon} />
          <StatItem value={enemiesKilled} icon={skullIcon} />
          <StatItem value={crystalsMined} icon={bagCrystalIcon} />
        </div>

        {/* SCORE */}
        <div
          className="flex items-center justify-between mt-1 pt-1 px-1"
          style={{ borderTop: "2px solid rgba(255,255,255,0.4)" }}
        >
          <span
            className="font-bold text-white"
            style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
          >
            {"Score:"}
          </span>
          <span
            className="font-bold text-white"
            style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
          >
            {score}
          </span>
        </div>
      </InnerPanel>
    </div>
  );
};

const StatItem = ({ value, icon }: { value: number | string; icon: string }) => (
  <div className="flex items-center gap-1">
    <span
      className="text-white font-bold"
      style={{ fontSize: `${PIXEL_SCALE * 10}px` }}
    >
      {value}
    </span>
    <img src={icon} style={{ width: `${PIXEL_SCALE * 10}px` }} alt="" />
  </div>
);
