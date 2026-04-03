import React from "react";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { playSfx } from "lib/audio";

type Props = {
  giantKaleCount: number;
  onPatchClick: () => void;
};

/**
 * Plain green field + centered Giant Kale (pixel art). Tap opens harvest / info modal.
 */
export const KingdomGameScene: React.FC<Props> = ({
  giantKaleCount,
  onPatchClick,
}) => {
  const count = Math.max(1, giantKaleCount);

  return (
    <div className="absolute inset-0 overflow-hidden select-none bg-[#2e7d32]">
      <button
        type="button"
        className="absolute inset-0 flex items-center justify-center p-6 cursor-pointer border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
        aria-label="Giant Kale — harvest and info"
        onClick={() => {
          playSfx("button");
          onPatchClick();
        }}
      >
        <div className="relative w-[min(92vw,420px)] max-h-[min(70dvh,420px)] flex items-center justify-center">
          <img
            src={KALE_KINGS_ASSETS.giant}
            alt=""
            className="w-full h-full max-h-[min(70dvh,420px)] object-contain [image-rendering:pixelated]"
            draggable={false}
          />
          <span className="absolute bottom-1 right-2 min-w-[2rem] text-center text-sm sm:text-base font-bold tabular-nums rounded bg-black/60 text-[#c8e6c9] px-2 py-0.5 pointer-events-none">
            ×{count}
          </span>
        </div>
      </button>
    </div>
  );
};
