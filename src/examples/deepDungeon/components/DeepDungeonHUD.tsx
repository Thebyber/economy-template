import React, { useState } from "react";
import { PIXEL_SCALE } from "lib/constants";
import { Modal } from "components/ui/Modal";
import { OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { HudContainer } from "components/ui/HudContainer";
import { EnergyStats } from "./EnergyStats";
import { DungeonProgress } from "./DungeonProgress";
import { DungeonDrops } from "./DungeonDrops";
import { DungeonInventory } from "./DungeonInventory";
import { MOVE_GUIDE ,INSTRUCTIONS, POINTS, ENEMIES_GUIDE, STATS_GUIDE } from "../DeepDungeonConstants";
import type { DeepDungeonRunStats } from "../DeepDungeonScene";
import type { RunProgress } from "../lib/DeepDungeonRunContext";
import Decimal from "decimal.js-light";
import { Box } from "components/ui/Box";

const pickaxeIcon = "/world/DeepDungeonAssets/pickaxe.png";
const potionIcon = "/world/DeepDungeonAssets/potion.png";
const keyChestIcon = "/world/DeepDungeonAssets/key_chest.png";

// ── Guide section ─────────────────────────────────────────────────────────────

const GuideSection: React.FC<{
  title: string;
  items: { image: string; description: string; width?: number }[];
}> = ({ title, items }) => (
  <div className="mb-4">
    <Label type="default" className="mb-2 uppercase text-sm">{title}</Label>
    {items.map(({ image, description, width = 10 }, i) => (
      <div key={i} className="flex items-center mb-3 mx-2">
        <img
          src={image}
          style={{ width: (width ?? 10) * PIXEL_SCALE, imageRendering: "pixelated", flexShrink: 0 }}
          alt=""
        />
        <p className="font-bold text-brown-1100 ml-3 flex-1">{description}</p>
      </div>
    ))}
  </div>
);

export const DungeonGuide: React.FC = () => (
  <div className="flex flex-col gap-1 pr-1 p-2 font-bold">
    <GuideSection title="Move" items={MOVE_GUIDE} />
    <GuideSection title="Instructions" items={INSTRUCTIONS} />
    <GuideSection title="Enemies" items={ENEMIES_GUIDE} />
    <GuideSection title="Stats" items={STATS_GUIDE} />
    <GuideSection title="Points" items={POINTS} />
  </div>
);

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  stats: DeepDungeonRunStats;
  enemiesKilled: number;
  crystalsMined: number;
  score: number;
  progress: RunProgress;
  onUsePotion: () => boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DeepDungeonHUD: React.FC<Props> = ({
  stats,
  enemiesKilled,
  crystalsMined,
  score,
  progress,
  onUsePotion,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showPotionPopup, setShowPotionPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"Enemies" | "Crystals" | "Chests" | "Drops" | "Guide">("Enemies");

  return (
    <HudContainer>
      {/* ── STATS / ENERGY BAR (top-left) ── */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{ top: `${PIXEL_SCALE * 6}px`, left: `${PIXEL_SCALE * 6}px` }}
      >
        <div className="pointer-events-auto flex flex-col gap-1">
          <EnergyStats
            stats={stats}
            enemiesKilled={enemiesKilled}
            crystalsMined={crystalsMined}
            score={score}
          />
        </div>
      </div>

      {/* ── RIGHT BUTTONS ── */}
      <div
        className="fixed z-50 flex flex-col items-end gap-2"
        style={{ right: `${PIXEL_SCALE * 3}px`, top: `${PIXEL_SCALE * 3}px` }}
      >
        {/* Codex button */}
        <div
          className="pointer-events-auto cursor-pointer hover:img-highlight group relative"
          style={{ width: `${PIXEL_SCALE * 22}px`, height: `${PIXEL_SCALE * 23}px` }}
          onClick={() => setShowCodex(true)}
        >
          <img src={DD_SUNNYSIDE.ui.round_button} className="w-full group-active:translate-y-[2px]" style={{ imageRendering: "pixelated" }} alt="" />
          <img src="/world/DeepDungeonAssets/codex.webp" className="absolute w-[60%] top-[15%] left-[20%]" style={{ imageRendering: "pixelated" }} alt="" />
        </div>

        {/* Inventory button */}
        <div
          className="pointer-events-auto cursor-pointer hover:img-highlight group relative"
          style={{ width: `${PIXEL_SCALE * 22}px`, height: `${PIXEL_SCALE * 23}px` }}
          onClick={() => setShowInventory(true)}
        >
          <img src={DD_SUNNYSIDE.ui.round_button} className="w-full group-active:translate-y-[2px]" style={{ imageRendering: "pixelated" }} alt="" />
          <img src={DD_SUNNYSIDE.icons.basket} className="absolute w-[60%] top-[15%] left-[20%]" style={{ imageRendering: "pixelated" }} alt="" />
        </div>

        {/* Pickaxe counter */}
        <div className="pointer-events-auto">
          <Box image={pickaxeIcon} count={new Decimal(stats.inventory.pickaxe ?? 0)} fillImage />
        </div>

        {/* Potion counter */}
        {(stats.inventory.potion ?? 0) > 0 && (
          <div className="pointer-events-auto">
            <Box
              image={potionIcon}
              count={new Decimal(stats.inventory.potion ?? 0)}
              fillImage
              onClick={() => setShowPotionPopup(true)}
            />
          </div>
        )}

        {/* Key chest counter */}
        {(stats.inventory.key_chest ?? 0) > 0 && (
          <div className="pointer-events-auto">
            <Box image={keyChestIcon} count={new Decimal(stats.inventory.key_chest ?? 0)} fillImage />
          </div>
        )}
      </div>

      {/* ── POTION POPUP ── */}
      <Modal show={showPotionPopup}>
        <OuterPanel className="flex flex-col items-center gap-3 p-4 w-64">
          <div className="flex items-center gap-2">
            <img src={potionIcon} className="w-8 h-8" style={{ imageRendering: "pixelated" }} alt="" />
            <p className="font-bold text-sm uppercase text-brown-1100">{"Energy Potion"}</p>
          </div>
          <p className="text-xs font-bold text-brown-1100 text-center">
            {`Restores ${8} energy. You have `}
            <span className="text-[#7b3f00]">{stats.inventory.potion ?? 0}</span>
            {" remaining."}
          </p>
          <Button
            className="w-full"
            disabled={(stats.inventory.potion ?? 0) <= 0}
            onClick={onUsePotion}
          >
            {`Use (+8 energy)`}
          </Button>
          <Button className="w-full" onClick={() => setShowPotionPopup(false)}>
            {"Close"}
          </Button>
        </OuterPanel>
      </Modal>

      {/* ── INVENTORY MODAL ── */}
      <Modal show={showInventory}>
        <OuterPanel className="flex flex-col h-[500px] max-h-[80vh] w-full max-w-lg p-1">
          <div className="flex items-center pl-1 mb-2">
            <div className="flex items-center grow">
              <img src={DD_SUNNYSIDE.icons.basket} className="h-6 mr-3 ml-1" alt="" />
              <p className="font-bold text-sm uppercase text-brown-1100">{"Dungeon Inventory"}</p>
            </div>
            <img
              src={DD_SUNNYSIDE.icons.close}
              className="cursor-pointer pointer-events-auto"
              onClick={() => setShowInventory(false)}
              style={{ width: `${PIXEL_SCALE * 11}px` }}
              alt="close"
            />
          </div>
          <OuterPanel className="flex-1 bg-[#e4a672] border-2 border-[#754733] rounded-sm overflow-hidden p-2">
            <DungeonInventory stats={stats} progress={progress} onUsePotion={onUsePotion} />
          </OuterPanel>
        </OuterPanel>
      </Modal>

      {/* ── CODEX MODAL ── */}
      <Modal show={showCodex}>
        <OuterPanel className="flex flex-col h-[500px] max-h-[80vh] w-full max-w-lg p-1">
          <div className="flex items-center pl-1 mb-2">
            <div className="flex items-center grow">
              <img src={DD_SUNNYSIDE.icons.search} className="h-6 mr-3 ml-1" alt="" />
              <p className="font-bold text-sm uppercase text-brown-1100">{"Dungeon Codex"}</p>
            </div>
            <img
              src={DD_SUNNYSIDE.icons.close}
              className="cursor-pointer pointer-events-auto"
              onClick={() => setShowCodex(false)}
              style={{ width: `${PIXEL_SCALE * 11}px` }}
              alt="close"
            />
          </div>

          <div className="flex flex-row flex-1 overflow-hidden">
            {/* Tab sidebar */}
            <div className="flex flex-col gap-1 pr-1 ml-0.5">
              <TabButton active={activeTab === "Enemies"} onClick={() => setActiveTab("Enemies")}>
                <img src="/world/DeepDungeonAssets/skull.png" style={{ width: 22, height: 22, imageRendering: "pixelated" }} alt="Enemies" />
              </TabButton>
              <TabButton active={activeTab === "Crystals"} onClick={() => setActiveTab("Crystals")}>
                <img src="/world/DeepDungeonAssets/bag_crystal.png" style={{ width: 22, height: 22, imageRendering: "pixelated" }} alt="Crystals" />
              </TabButton>
              <TabButton active={activeTab === "Chests"} onClick={() => setActiveTab("Chests")}>
                <img src="/world/DeepDungeonAssets/chest.png" style={{ width: 22, height: 22, imageRendering: "pixelated" }} alt="Chests" />
              </TabButton>
              <TabButton active={activeTab === "Drops"} onClick={() => setActiveTab("Drops")}>
                <img src="/world/DeepDungeonAssets/codex.webp" style={{ width: 22, height: 22, imageRendering: "pixelated" }} alt="Drops" />
              </TabButton>
              <TabButton active={activeTab === "Guide"} onClick={() => setActiveTab("Guide")}>
                <img src="/world/DeepDungeonAssets/chores.webp" style={{ width: 22, height: 22, imageRendering: "pixelated" }} alt="Guide" />
              </TabButton>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto scrollable flex flex-col rounded-md p-1 ml-1">
              {activeTab === "Enemies" && <DungeonProgress category="Enemies" progress={progress} />}
              {activeTab === "Crystals" && <DungeonProgress category="Crystals" progress={progress} />}
              {activeTab === "Chests" && <DungeonProgress category="Chests" progress={progress} />}
              {activeTab === "Drops" && <DungeonDrops />}
              {activeTab === "Guide" && <DungeonGuide />}
            </div>
          </div>
        </OuterPanel>
      </Modal>
    </HudContainer>
  );
};

// ── Small helper ──────────────────────────────────────────────────────────────

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <OuterPanel
    className="p-1 cursor-pointer pointer-events-auto"
    style={{ background: active ? "#ead4aa" : undefined }}
    onClick={onClick}
  >
    {children}
  </OuterPanel>
);
