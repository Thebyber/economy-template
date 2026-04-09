import React from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import { MinigamePortalProvider } from "lib/portal";
import { MmoRoomProvider } from "lib/mmo";
import { createPlazaPartyOfflineMinigame } from "./lib/plazaPartyOfflineMinigame";
import { PLAZA_PARTY_MINIGAME_SLUG } from "./lib/plazaPartySlug";
import { PlazaPartyGamePage } from "./PlazaPartyGamePage";

/** Plaza Party sample — plaza exploration and mushroom collectibles. */
export const PlazaPartyApp: React.FC = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <MinigamePortalProvider
        offlineActions={{}}
        offlineMinigame={createPlazaPartyOfflineMinigame}
      >
        <MmoRoomProvider
          connectOptions={{ sceneId: PLAZA_PARTY_MINIGAME_SLUG }}
        >
          <Routes>
            <Route path="/" element={<PlazaPartyGamePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MmoRoomProvider>
      </MinigamePortalProvider>
    </MemoryRouter>
  );
};
