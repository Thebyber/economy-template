import React from "react";
import { ChickenRescueApp } from "examples/chickenRescue/ChickenRescue";
import { UiResourcesApp } from "examples/ui-resources/UiResourcesApp";
import { HideAndSeekApp } from "examples/hideAndSeek/HideAndSeekApp";
import { PlazaPartyApp } from "examples/plazaParty/PlazaPartyApp";

/**
 * Default sample: Chicken Rescue (Phaser + portal session). Swap in
 * {@link examples/ui-resources/UiResourcesApp}, `examples/plazaParty/PlazaPartyApp`,
 * or another example from `src/examples/`.
 */
export const App: React.FC = () => {
  return <PlazaPartyApp />;
};
