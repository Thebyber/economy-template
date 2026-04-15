import React from "react";
import { MemoryRouter } from "react-router-dom";
import { MinigamePortalProvider } from "lib/portal";
import { DEEP_DUNGEON_OFFLINE_ACTIONS } from "./lib/deepDungeonOfflineActions";
import { createDeepDungeonOfflineMinigame } from "./lib/deepDungeonOfflineMinigame";
import { DeepDungeonRoutes } from "./DeepDungeonRoutes";

/**
 * Root component for the Deep Dungeon minigame.
 * MemoryRouter keeps /home ↔ /game navigation off the real iframe URL.
 * MinigamePortalProvider bootstraps the Economy API session (or falls back
 * to the offline stub when VITE_MINIGAMES_API_URL is unset).
 */
export const DeepDungeonApp: React.FC = () => {
  return (
    <MemoryRouter initialEntries={["/home"]}>
      <MinigamePortalProvider
        offlineActions={DEEP_DUNGEON_OFFLINE_ACTIONS}
        offlineMinigame={createDeepDungeonOfflineMinigame}
      >
        <DeepDungeonRoutes />
      </MinigamePortalProvider>
    </MemoryRouter>
  );
};
