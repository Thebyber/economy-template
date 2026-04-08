/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_ANIMATION_URL?: string;
  readonly VITE_IMAGE_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  /** Minigames API Gateway (session, actions, animate, bumpkin metadata). */
  readonly VITE_MINIGAMES_API_URL?: string;
  /** `items` key for GAMEOVER `amounts` (e.g. `1` for chicken-rescue-v2). */
  readonly VITE_GAMEOVER_MINT_TOKEN_KEY?: string;
  readonly VITE_PORTAL_APP?: string;
  readonly VITE_PORTAL_GAME_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
