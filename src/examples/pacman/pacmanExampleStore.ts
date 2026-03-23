import { atom } from "nanostores";

export type PacmanExampleResult = { won: boolean; score: number };

/** Local state for the Bumpkin maze example only (not `$gameState`). */
export type PacmanExampleState = {
  score: number;
  lives: number;
  highScore: number;
  playing: boolean;
  result: PacmanExampleResult | null;
};

export const $pacmanExampleState = atom<PacmanExampleState>({
  score: 0,
  lives: 3,
  highScore: 0,
  playing: true,
  result: null,
});

export function patchPacmanExampleState(
  partial: Partial<PacmanExampleState>,
): void {
  $pacmanExampleState.set({ ...$pacmanExampleState.get(), ...partial });
}
