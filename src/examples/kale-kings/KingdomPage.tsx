import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $kaleKingsState } from "examples/kale-kings/kaleKingsStore";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { KingdomGameScene } from "examples/kale-kings/kingdom/KingdomGameScene";
import { GiantKaleModal } from "examples/kale-kings/kingdom/GiantKaleModal";
import { ShopModal } from "examples/kale-kings/kingdom/ShopModal";
import { RunPickerModal } from "examples/kale-kings/kingdom/RunPickerModal";
import { playSfx } from "lib/audio";

function KaleHudIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={20}
      height={20}
      className="shrink-0 [image-rendering:pixelated] object-contain"
    />
  );
}

type ModalKey = "giant" | "shop" | "runs" | null;

/** Game-style kingdom: world view + HUD; menus open as modals. */
export const KingdomPage: React.FC = () => {
  const s = useStore($kaleKingsState);
  const [modal, setModal] = useState<ModalKey>(null);

  const closeModal = () => setModal(null);

  return (
    <div className="fixed inset-0 bg-black min-h-dvh text-[#e8f5e9]">
      <div className="relative w-full min-h-dvh h-dvh max-w-lg mx-auto sm:max-w-none sm:mx-0 overflow-hidden shadow-2xl sm:shadow-none">
        <KingdomGameScene
          giantKaleCount={s.giantKaleCount}
          onPatchClick={() => setModal("giant")}
        />

        {/* Title — subtle, in-world */}
        <div
          className="absolute top-3 left-3 z-40 pointer-events-none"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          <h1 className="text-lg font-bold text-white/95 tracking-tight">
            Kale Kings
          </h1>
          <p className="text-[9px] text-white/75 max-w-[140px] leading-tight mt-0.5">
            Grow your Kale Kingdom
          </p>
        </div>

        {/* Currency HUD */}
        <div className="absolute top-3 right-3 z-40 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 rounded px-1.5 py-1 bg-black/45 border border-white/15 backdrop-blur-sm">
            <KaleHudIcon src={KALE_KINGS_ASSETS.kale} alt="Kale" />
            <Label type="success" className="!text-[10px] px-1 py-0">
              {s.kale}
            </Label>
          </div>
          <div className="flex items-center gap-1 rounded px-1.5 py-1 bg-black/45 border border-white/15 backdrop-blur-sm">
            <KaleHudIcon src={KALE_KINGS_ASSETS.magical} alt="Magical" />
            <Label type="vibrant" className="!text-[10px] px-1 py-0">
              {s.magicalKale}
            </Label>
          </div>
          <div className="flex items-center gap-1 rounded px-1.5 py-1 bg-black/45 border border-white/15 backdrop-blur-sm">
            <KaleHudIcon src={KALE_KINGS_ASSETS.golden} alt="Golden" />
            <Label
              type="chill"
              className="!text-[10px] px-1 py-0 !text-[#3e2731]"
            >
              {s.goldenKale}
            </Label>
          </div>
        </div>

        {/* Shop */}
        <button
          type="button"
          className="absolute top-[4.5rem] left-3 z-40 w-12 h-12 rounded-lg bg-[#4e342e]/85 border-2 border-[#8d6e63]/70 shadow-lg flex items-center justify-center text-xl hover:bg-[#5d4037]/90 active:scale-95 transition-transform"
          aria-label="Open shop"
          onClick={() => {
            playSfx("button");
            setModal("shop");
          }}
        >
          🛒
        </button>

        {/* Primary run CTA */}
        <div className="absolute bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-xs">
            <Button
              type="button"
              className="!min-h-[52px] w-full text-base font-bold shadow-[0_6px_0_rgba(0,0,0,0.25)]"
              onClick={() => {
                playSfx("button");
                setModal("runs");
              }}
            >
              FORAGE RUN
            </Button>
            <p className="text-[10px] text-center text-white/80 mt-2 drop-shadow-md">
              Tap the Giant Kale patch to harvest · Shop for more giants
            </p>
          </div>
        </div>
      </div>

      <GiantKaleModal open={modal === "giant"} onClose={closeModal} />
      <ShopModal open={modal === "shop"} onClose={closeModal} />
      <RunPickerModal open={modal === "runs"} onClose={closeModal} />
    </div>
  );
};
