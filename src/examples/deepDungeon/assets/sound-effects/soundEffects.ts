// Sound effect paths for the Preloader (world/plaza scenes).
// DeepDungeon loads its own audio in DeepDungeonScene.preload() — these are
// used only for shared world scenes. Pointing to local DeepDungeon audio so
// they resolve immediately without CDN requests that could block the Preloader.
export type Footsteps = "dirt_footstep" | "wood_footstep" | "sand_footstep";

export const SOUNDS = {
  footsteps: {
    dirt: "/world/DeepDungeonAssets/sword_attack.mp3",
    wood: "/world/DeepDungeonAssets/sword_attack.mp3",
    sand: "/world/DeepDungeonAssets/sword_attack.mp3",
  },
  loops: {
    nature_1: "/world/DeepDungeonAssets/backgroundMusic.wav",
    engine: "/world/DeepDungeonAssets/backgroundMusic.wav",
  },
  desert: {
    dig: "/world/DeepDungeonAssets/mine_crystal.mp3",
    drill: "/world/DeepDungeonAssets/mine_crystal.mp3",
    reveal: "/world/DeepDungeonAssets/mine_crystal.mp3",
  },
} as const;
