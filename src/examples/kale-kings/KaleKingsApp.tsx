import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KingdomPage } from "examples/kale-kings/KingdomPage";
import { AdventurePage } from "examples/kale-kings/AdventurePage";

/**
 * Kale Kings — two routes: kingdom (`/`) and Phaser hunt (`/adventure`).
 * Mount as the root app (see `App.tsx`).
 */
export const KaleKingsApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KingdomPage />} />
        <Route path="/adventure" element={<AdventurePage />} />
      </Routes>
    </BrowserRouter>
  );
};
