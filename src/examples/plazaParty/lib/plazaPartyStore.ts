import { atom } from "nanostores";

export type PlazaPartyHudState = {
  mushrooms: number;
};

export const $plazaPartyHud = atom<PlazaPartyHudState>({ mushrooms: 0 });

export function addPlazaPartyMushrooms(count = 1): void {
  const prev = $plazaPartyHud.get();
  $plazaPartyHud.set({ mushrooms: prev.mushrooms + count });
}

export function resetPlazaPartyHud(): void {
  $plazaPartyHud.set({ mushrooms: 0 });
}
