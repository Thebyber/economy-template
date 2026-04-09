import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useStore } from "@nanostores/react";
import { $gameState, patchGameState } from "lib/gameStore";
import { useMinigameSession } from "lib/portal";
import { popupSingleton } from "lib/popupSingleton";
import { Label } from "components/ui/Label";
import { HideAndSeekScene } from "./game/HideAndSeekScene";
import { HideAndSeekNextTargetHud } from "./components/HideAndSeekNextTargetHud";
import { prepareHideAndSeekRoundFromSession } from "./lib/hideAndSeekRoundStore";
import { gameoverMintTokenKey } from "./lib/bumpkinHunterPortal";

function fallbackHalfViewport() {
  return {
    width: Math.max(160, Math.floor(window.innerWidth / 2)),
    height: Math.max(120, Math.floor(window.innerHeight / 2)),
  };
}

export const HideAndSeekGamePage: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const skulls = useStore($gameState).skulls;
  const skullIconSrc = `${import.meta.env.BASE_URL}game/skull.png`;
  const { playerEconomy, economyMeta } = useMinigameSession();

  useEffect(() => {
    const mintKey = gameoverMintTokenKey();
    const bal = playerEconomy.balances[mintKey];
    if (typeof bal === "number" && Number.isFinite(bal)) {
      patchGameState({ skulls: Math.max(0, Math.floor(bal)) });
    }

    const round = prepareHideAndSeekRoundFromSession(economyMeta?.dashboard);
    const first = round.eatOrder[0];
    popupSingleton.open("hideAndSeekWelcome", {
      tokenParts: first?.tokenParts ?? "",
      npcName: first?.npcName ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once from initial session snapshot
  }, []);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const readSize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w >= 8 && h >= 8) {
        return { width: Math.max(160, w), height: Math.max(120, h) };
      }
      return fallbackHalfViewport();
    };

    const { width, height } = readSize();

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      width,
      height,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#2d4a32",
      fps: { smoothStep: false },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          fixedStep: true,
          fps: 60,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
      },
      scene: [HideAndSeekScene],
    });

    game.canvas.style.imageRendering = "pixelated";

    const ro = new ResizeObserver(() => {
      const next = readSize();
      game.scale.resize(next.width, next.height);
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      game.destroy(true);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#1e2a24] flex items-center justify-center p-2">
      <div
        ref={hostRef}
        className="h-1/2 w-1/2 max-h-[50dvh] max-w-[50vw] min-h-[120px] min-w-[160px] shrink-0 overflow-hidden rounded-sm border-2 border-black/30 [box-shadow:2px_2px_0_rgba(0,0,0,0.25)]"
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-2 left-2 pointer-events-auto flex flex-col gap-1 items-start">
          <Label type="default" className="flex-row gap-1.5">
            <img
              src={skullIconSrc}
              alt=""
              width={14}
              height={14}
              className="shrink-0 [image-rendering:pixelated]"
              draggable={false}
            />
            <span>Skulls: {skulls}</span>
          </Label>
        </div>

        <div className="pointer-events-auto">
          <HideAndSeekNextTargetHud />
        </div>
      </div>
    </div>
  );
};
