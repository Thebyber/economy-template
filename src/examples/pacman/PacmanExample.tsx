import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useStore } from "@nanostores/react";
import { PacmanScene } from "examples/pacman/PacmanScene";
import {
  $pacmanExampleState,
  patchPacmanExampleState,
} from "examples/pacman/pacmanExampleStore";
import { PACMAN_RESTART_EVENT } from "examples/pacman/constants";
import { Panel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { Button } from "components/ui/Button";
import { playSfx } from "lib/audio";

/**
 * Self-contained Bumpkin maze sample: mount this in your app or a dev route.
 * Not used by the default template shell (`App` + `PhaserGame` use `MainScene`).
 */
export const PacmanExample: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const state = useStore($pacmanExampleState);

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
      backgroundColor: "#0f0f1a",
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
      scene: [PacmanScene],
    });

    game.canvas.style.imageRendering = "pixelated";

    return () => {
      game.destroy(true);
    };
  }, []);

  const result = state.result;

  const playAgain = () => {
    playSfx("button");
    document.dispatchEvent(new Event(PACMAN_RESTART_EVENT));
  };

  const dismiss = () => {
    playSfx("button");
    patchPacmanExampleState({ result: null });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <Label type="formula">Bumpkin maze (example)</Label>
        <Label type="default">Score {state.score}</Label>
        <Label type="default">Lives {state.lives}</Label>
        <Label type="chill">Best {state.highScore}</Label>
      </div>
      <div className="relative w-full aspect-[480/320] bg-[#2a2a2a] rounded-sm overflow-hidden">
        <div ref={hostRef} className="absolute inset-0" />
        {result ? (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 p-4"
            role="dialog"
            aria-modal="true"
          >
            <Panel className="w-full max-w-xs">
              <div className="flex flex-col gap-3 p-1">
                <Label type={result.won ? "chill" : "warning"}>
                  {result.won ? "You cleared the maze!" : "Game over"}
                </Label>
                <p className="text-xs text-[#3e2731] leading-relaxed">
                  Score: <strong>{result.score}</strong>
                </p>
                <div className="flex flex-col gap-2">
                  <Button type="button" onClick={playAgain}>
                    Play again
                  </Button>
                  <Button type="button" variant="secondary" onClick={dismiss}>
                    Dismiss overlay
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    </div>
  );
};
