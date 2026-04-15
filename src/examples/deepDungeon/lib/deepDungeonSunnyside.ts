import { CONFIG } from "lib/config";

const B = () => CONFIG.PROTECTED_IMAGE_URL;

/** Subset of SUNNYSIDE icons used by DeepDungeon HUD components. */
export const DD_SUNNYSIDE = {
  icons: {
    close: `${B()}/icons/close.png`,
    confirm: `${B()}/icons/confirm.png`,
    basket: `${B()}/icons/basket.png`,
    search: `${B()}/icons/search.png`,
    hammer: `${B()}/icons/hammer.png`,
    lightning: `${B()}/icons/lightning.png`,
    treasure: `${B()}/icons/treasure.png`,
    worldIcon: `${B()}/icons/world_icon.png`,
    sword: `${B()}/icons/sword.png`,
    expression_confused: `${B()}/icons/expression_confused.png`,
  },
  ui: {
    round_button: `${B()}/ui/round_button.png`,
  },
} as const;
