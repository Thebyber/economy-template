import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import {
  $kaleKingsState,
  abandonAdventureRun,
  claimAdventureReward,
} from "examples/kale-kings/kaleKingsStore";
import type { RunZone } from "examples/kale-kings/kaleKingsRules";
import { KaleKingsPhaserGame } from "examples/kale-kings/KaleKingsPhaserGame";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { playSfx } from "lib/audio";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";

const ZONE_TITLE: Record<RunZone, string> = {
  meadow: "Meadow",
  forest: "Forest",
  mystio: "Mystio",
};

/** Hidden forest minigame — rewards depend on paid run zone. */
export const AdventurePage: React.FC = () => {
  const { adventureSuccessPending, adventureKaleFound, pendingRunLoot, activeRunZone } =
    useStore($kaleKingsState);
  const navigate = useNavigate();
  const location = useLocation();
  const navZone = (location.state as { zone?: RunZone } | null)?.zone;

  useEffect(() => {
    const s = $kaleKingsState.get();
    if (!navZone || s.activeRunZone !== navZone) {
      navigate("/", { replace: true });
    }
  }, [navZone, navigate]);

  const onClaim = () => {
    playSfx("button");
    claimAdventureReward();
    navigate("/");
  };

  const zoneLabel = activeRunZone ? ZONE_TITLE[activeRunZone] : "…";

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0d1f15] text-[#181425]">
      <header className="relative z-20 flex items-center justify-between gap-2 px-3 py-2 bg-black/25 text-[#c8e6c9] text-xs">
        <Link
          to="/"
          className="underline underline-offset-2 hover:text-white opacity-90"
          onClick={() => {
            playSfx("button");
            abandonAdventureRun();
          }}
        >
          ← Kingdom
        </Link>
        <span className="opacity-90">
          {zoneLabel} · Kale found {adventureKaleFound} / 5
        </span>
      </header>

      <div className="flex-1 min-h-0 relative">
        <KaleKingsPhaserGame />

        {adventureSuccessPending && pendingRunLoot ? (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/55"
            role="dialog"
            aria-modal="true"
            aria-label="Run complete"
          >
            <Panel className="w-full max-w-sm">
              <div className="flex flex-col gap-3 p-1">
                <Label type="success">Success!</Label>
                <p className="text-xs text-[#3e2731] leading-relaxed">
                  You explored the hidden forest and secured your haul for{" "}
                  <strong>{zoneLabel}</strong>.
                </p>
                <ul className="text-xs text-[#3e2731] space-y-2">
                  {pendingRunLoot.magical > 0 ? (
                    <li className="flex items-center gap-2">
                      <img
                        src={KALE_KINGS_ASSETS.magical}
                        alt=""
                        width={20}
                        height={20}
                        className="[image-rendering:pixelated] object-contain shrink-0"
                      />
                      <span>
                        <strong>+{pendingRunLoot.magical}</strong> Magical Kale
                      </span>
                    </li>
                  ) : null}
                  {pendingRunLoot.golden > 0 ? (
                    <li className="flex items-center gap-2">
                      <img
                        src={KALE_KINGS_ASSETS.golden}
                        alt=""
                        width={20}
                        height={20}
                        className="[image-rendering:pixelated] object-contain shrink-0"
                      />
                      <span>
                        <strong>+{pendingRunLoot.golden}</strong> Golden Kale
                      </span>
                    </li>
                  ) : null}
                  {pendingRunLoot.magical === 0 &&
                  pendingRunLoot.golden === 0 ? (
                    <li className="text-[#3e2731]/70">
                      No Magical or Golden Kale rolled this run.
                    </li>
                  ) : null}
                </ul>
                <Button type="button" onClick={onClaim}>
                  Claim & return to kingdom
                </Button>
              </div>
            </Panel>
          </div>
        ) : null}
      </div>
    </div>
  );
};
