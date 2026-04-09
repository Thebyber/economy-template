import React from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import { MinigamePortalProvider } from "lib/portal";
import { createHideAndSeekOfflineMinigame } from "./lib/hideAndSeekOfflineMinigame";
import { HideAndSeekGamePage } from "./HideAndSeekGamePage";

/**
 * Hide and Seek — Phaser at `/`.
 * With `VITE_MINIGAMES_API_URL` (or `?minigamesApiUrl=`), loads session via
 * `GET …/data?type=session` like Chicken Rescue; otherwise offline stub economy.
 */
export const HideAndSeekApp: React.FC = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <MinigamePortalProvider
        offlineActions={{}}
        offlineMinigame={createHideAndSeekOfflineMinigame}
      >
        <Routes>
          <Route path="/" element={<HideAndSeekGamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MinigamePortalProvider>
    </MemoryRouter>
  );
};
