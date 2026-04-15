import React, { useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
import { Preloader } from "./world/scenes/Preloader";
import { DeepDungeonScene } from "./DeepDungeonScene";
import type { DeepDungeonPhaserApi } from "./DeepDungeonScene";
import type { DeepDungeonPlayerStats } from "./lib/deepDungeonLifecycle";

interface Props {
  bumpkin: unknown;
  farmId: number;
  phaserApi: DeepDungeonPhaserApi;
  initialStats: DeepDungeonPlayerStats;
  onGameReady?: (game: Game) => void;
}

export const DeepDungeonGame: React.FC<Props> = ({
  bumpkin,
  farmId,
  phaserApi,
  initialStats,
  onGameReady,
}) => {
  const gameRef = useRef<Game | undefined>(undefined);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: { target: 30, smoothStep: true },
      backgroundColor: "#000000",
      parent: "game-content",
      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          { key: "rexNinePatchPlugin", plugin: NinePatchPlugin, start: true },
          { key: "rexVirtualJoystick", plugin: VirtualJoystickPlugin, start: true },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: "arcade",
        arcade: { debug: false, gravity: { x: 0, y: 0 } },
      },
      scene: [Preloader, DeepDungeonScene],
      loader: { crossOrigin: "anonymous" },
    };

    gameRef.current = new Game(config);

    gameRef.current.registry.set("initialScene", "deep-dungeon");
    gameRef.current.registry.set("gameState", { bumpkin });
    gameRef.current.registry.set("id", farmId);
    gameRef.current.registry.set("phaserApi", phaserApi);
    gameRef.current.registry.set("initialStats", initialStats);

    onGameReady?.(gameRef.current);

    return () => {
      gameRef.current?.destroy(true);
    };
    // Intentionally run once on mount only — phaserApi is a ref-backed object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div id="game-content" />
    </div>
  );
};
