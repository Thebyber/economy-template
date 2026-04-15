import { useMemo } from "react";
import { useMinigameSession } from "lib/portal";

export type DeepDungeonActionIds = {
  startGame: string;
  gameOver: string;
  buyAttempts: string;
};

const DEFAULTS: DeepDungeonActionIds = {
  startGame: "START_GAME",
  gameOver: "GAMEOVER",
  buyAttempts: "BUY_ATTEMPTS",
};

function resolveId(
  actions: Record<string, unknown>,
  canonical: string,
): string {
  return canonical in actions ? canonical : canonical;
}

function resolveDeepDungeonActionIds(
  actions: Record<string, unknown>,
): DeepDungeonActionIds {
  return {
    startGame: resolveId(actions, DEFAULTS.startGame),
    gameOver: resolveId(actions, DEFAULTS.gameOver),
    buyAttempts: resolveId(actions, DEFAULTS.buyAttempts),
  };
}

export function useDeepDungeonActionIds(): DeepDungeonActionIds {
  const { actions } = useMinigameSession();
  return useMemo(() => resolveDeepDungeonActionIds(actions), [actions]);
}
