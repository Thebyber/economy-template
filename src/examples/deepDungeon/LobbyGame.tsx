import React, { useCallback, useEffect, useRef } from "react";
import Phaser from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import type { Room } from "colyseus.js";
import { PIXEL_SCALE } from "lib/constants";
import { MMO_SERVER_REGISTRY_KEY } from "lib/mmo";
import { DD_SUNNYSIDE } from "./lib/deepDungeonSunnyside";
import { LobbyScene } from "./LobbyScene";

interface Props {
  bumpkin: unknown;
  farmId: number;
  username: string;
  faction?: string;
  room: Room | null;
  onEnterDoor: () => void;
  onBack: () => void;
  onOpenBlacksmith: () => void;
  onOpenInventory: () => void;
}

export const LobbyGame: React.FC<Props> = ({
  bumpkin,
  farmId,
  username,
  faction,
  room,
  onEnterDoor,
  onBack,
  onOpenBlacksmith,
  onOpenInventory,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | undefined>(undefined);
  const onEnterDoorRef = useRef(onEnterDoor);
  onEnterDoorRef.current = onEnterDoor;
  const onOpenBlacksmithRef = useRef(onOpenBlacksmith);
  onOpenBlacksmithRef.current = onOpenBlacksmith;

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const w = Math.max(320, parent.clientWidth || window.innerWidth);
    const h = Math.max(240, parent.clientHeight || window.innerHeight);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      backgroundColor: "#000000",
      parent,
      pixelArt: true,
      autoRound: true,
      width: w,
      height: h,
      plugins: {
        global: [
          { key: "rexNinePatchPlugin", plugin: NinePatchPlugin, start: true },
        ],
      },
      physics: {
        default: "arcade",
        arcade: { debug: false, gravity: { x: 0, y: 0 } },
      },
      scene: [LobbyScene],
      loader: { crossOrigin: "anonymous" },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
      },
    });

    game.registry.set("gameState", { bumpkin });
    game.registry.set("id", farmId);
    game.registry.set("username", username);
    game.registry.set("faction", faction);
    game.registry.set("onEnterDoor", () => onEnterDoorRef.current());
    game.registry.set("onOpenBlacksmith", () => onOpenBlacksmithRef.current());

    gameRef.current = game;

    const ro = new ResizeObserver(() => {
      const nw = Math.max(320, parent.clientWidth);
      const nh = Math.max(240, parent.clientHeight);
      game.scale.resize(nw, nh);
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      game.registry.remove(MMO_SERVER_REGISTRY_KEY);
      game.destroy(true);
      gameRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (room) {
      game.registry.set(MMO_SERVER_REGISTRY_KEY, room);
    } else {
      game.registry.remove(MMO_SERVER_REGISTRY_KEY);
    }
  }, [room]);

  const handleAttack = useCallback(() => {
    const scene = gameRef.current?.scene.getScene("lobby") as LobbyScene | null;
    scene?.triggerAttack();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ touchAction: "none", userSelect: "none" }}>
      <div ref={hostRef} className="absolute inset-0" />

      {/* Trophy button — bottom left */}
      <div
        className="absolute bottom-4 left-4 z-10 cursor-pointer hover:img-highlight group"
        style={{ width: PIXEL_SCALE * 22, height: PIXEL_SCALE * 23 }}
        onPointerDown={(e) => { e.stopPropagation(); onBack(); }}
      >
        <img src={DD_SUNNYSIDE.ui.round_button} className="w-full group-active:translate-y-[2px]" style={{ imageRendering: "pixelated" }} alt="" />
        <img src="/world/DeepDungeonAssets/trophy.png" className="absolute w-[55%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ imageRendering: "pixelated" }} alt="Back" />
      </div>

      {/* Inventory button — top right */}
      <div
        className="absolute top-4 right-4 z-10 cursor-pointer hover:img-highlight group"
        style={{ width: PIXEL_SCALE * 22, height: PIXEL_SCALE * 23 }}
        onPointerDown={(e) => { e.stopPropagation(); onOpenInventory(); }}
      >
        <img src={DD_SUNNYSIDE.ui.round_button} className="w-full group-active:translate-y-[2px]" style={{ imageRendering: "pixelated" }} alt="" />
        <img src={DD_SUNNYSIDE.icons.basket} className="absolute w-[60%] top-[15%] left-[20%]" style={{ imageRendering: "pixelated" }} alt="Inventory" />
      </div>

      {/* Attack button — bottom right */}
      <div
        className="absolute bottom-4 right-4 z-10 cursor-pointer hover:img-highlight group"
        style={{ width: PIXEL_SCALE * 22, height: PIXEL_SCALE * 23 }}
        onPointerDown={(e) => { e.stopPropagation(); handleAttack(); }}
      >
        <img src={DD_SUNNYSIDE.ui.round_button} className="w-full group-active:translate-y-[2px]" style={{ imageRendering: "pixelated" }} alt="" />
        <img src="/world/DeepDungeonAssets/sword.png" className="absolute w-[60%] top-[15%] left-[20%]" style={{ imageRendering: "pixelated" }} alt="Attack" />
      </div>
    </div>
  );
};
