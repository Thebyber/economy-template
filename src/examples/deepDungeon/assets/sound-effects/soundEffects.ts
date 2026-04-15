import { CONFIG } from "lib/config";

const B = () => CONFIG.PROTECTED_IMAGE_URL;

export type Footsteps = "dirt_footstep" | "wood_footstep" | "sand_footstep";

export const SOUNDS = {
  footsteps: {
    dirt: `${B()}/sound-effects/dirt_footstep.mp3`,
    wood: `${B()}/sound-effects/wood_footstep.mp3`,
    sand: `${B()}/sound-effects/sand_footstep.mp3`,
  },
  loops: {
    nature_1: `${B()}/sound-effects/nature_1.mp3`,
    engine: `${B()}/sound-effects/engine.mp3`,
  },
  desert: {
    dig: `${B()}/sound-effects/dig.mp3`,
    drill: `${B()}/sound-effects/drill.mp3`,
    reveal: `${B()}/sound-effects/reveal.mp3`,
  },
} as const;
