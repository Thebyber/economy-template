import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { KaleAdventureScene } from "examples/kale-kings/KaleAdventureScene";

/** Full-bleed Phaser host for the Kale Kings hunt (`/adventure`). */
export function KaleKingsPhaserGame() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: 480,
      height: 320,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#2d4a3e",
      fps: {
        smoothStep: false,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          fixedStep: true,
          fps: 60,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
      },
      scene: [KaleAdventureScene],
    });

    game.canvas.style.imageRendering = "pixelated";

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 w-full h-full min-h-[240px] bg-[#1a2f24]"
    />
  );
}
