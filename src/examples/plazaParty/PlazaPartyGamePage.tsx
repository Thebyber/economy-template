import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { useStore } from "@nanostores/react";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";
import { MMO_SERVER_REGISTRY_KEY, useMmoRoom } from "lib/mmo";
import { PlazaPartyScene } from "./game/PlazaPartyScene";
import { $plazaPartyHud, resetPlazaPartyHud } from "./lib/plazaPartyStore";

function fallbackViewport() {
  return {
    width: Math.max(320, Math.floor(window.innerWidth * 0.92)),
    height: Math.max(240, Math.floor(window.innerHeight * 0.78)),
  };
}

export const PlazaPartyGamePage: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const mushrooms = useStore($plazaPartyHud).mushrooms;
  const { phase, room, retry } = useMmoRoom();
  const [playOffline, setPlayOffline] = useState(false);

  useEffect(() => {
    resetPlazaPartyHud();
  }, []);

  const runGame = phase === "connected" && !!room || playOffline;

  useEffect(() => {
    if (!runGame) return;

    const parent = hostRef.current;
    if (!parent) return;

    const readSize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w >= 8 && h >= 8) {
        return { width: Math.max(320, w), height: Math.max(240, h) };
      }
      return fallbackViewport();
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
      backgroundColor: "#1a2520",
      fps: { smoothStep: false },
      loader: { crossOrigin: "anonymous" },
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
      scene: [PlazaPartyScene],
    });

    if (room) {
      game.registry.set(MMO_SERVER_REGISTRY_KEY, room);
    }

    game.canvas.style.imageRendering = "pixelated";

    const ro = new ResizeObserver(() => {
      const next = readSize();
      game.scale.resize(next.width, next.height);
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      game.registry.remove(MMO_SERVER_REGISTRY_KEY);
      game.destroy(true);
    };
  }, [runGame, room]);

  if (phase === "loading" || phase === "idle") {
    return (
      <div className="fixed inset-0 z-0 bg-[#141c18] flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-stone-200 text-sm">Loading…</p>
      </div>
    );
  }

  if (phase === "error" && !playOffline) {
    return (
      <div className="fixed inset-0 z-0 bg-[#141c18] flex flex-col items-center justify-center p-4">
        <Panel className="max-w-md w-full">
          <div className="p-3 flex flex-col gap-2">
            <Label type="danger">Something went wrong</Label>
            <p className="text-sm text-stone-600">
              We couldn&apos;t get you into the plaza. You can try again or play
              on your own.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => retry()}>Try again</Button>
              <Button onClick={() => setPlayOffline(true)}>Play on your own</Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#141c18] flex flex-col items-center justify-center gap-3 p-3">
      <div className="text-center max-w-lg px-2">
        <h1 className="text-lg font-semibold text-stone-100 tracking-tight">
          Plaza Party
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Explore the plaza and collect mushrooms. Use the arrow keys or WASD.
          {playOffline ? (
            <span className="text-stone-500"> You&apos;re playing on your own.</span>
          ) : null}
        </p>
      </div>

      <div
        ref={hostRef}
        className="w-[min(960px,92vw)] h-[min(640px,78dvh)] min-h-[240px] shrink-0 overflow-hidden rounded-sm border-2 border-black/30 [box-shadow:2px_2px_0_rgba(0,0,0,0.25)]"
      />

      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 items-start">
        <Label type="default" className="pointer-events-auto">
          Mushrooms: {mushrooms}
        </Label>
      </div>
    </div>
  );
};
