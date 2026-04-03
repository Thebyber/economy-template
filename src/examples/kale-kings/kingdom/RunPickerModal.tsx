import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import {
  $kaleKingsState,
  payAndBeginRun,
  unlockForest,
  unlockMystio,
  canAffordRun,
} from "examples/kale-kings/kaleKingsStore";
import {
  RUN_COST_KALE,
  UNLOCK_FOREST_MAGICAL,
  UNLOCK_MYSTIO,
  type RunZone,
} from "examples/kale-kings/kaleKingsRules";
import { KingdomModalShell } from "examples/kale-kings/kingdom/KingdomModalShell";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { playSfx } from "lib/audio";

const ZONE_LABEL: Record<RunZone, string> = {
  meadow: "Meadow",
  forest: "Forest",
  mystio: "Mystio",
};

type Props = { open: boolean; onClose: () => void };

export const RunPickerModal: React.FC<Props> = ({ open, onClose }) => {
  const s = useStore($kaleKingsState);
  const navigate = useNavigate();

  const startRun = (zone: RunZone) => {
    playSfx("button");
    if (payAndBeginRun(zone)) {
      onClose();
      navigate("/adventure", { state: { zone } });
    }
  };

  return (
    <KingdomModalShell open={open} onClose={onClose} title="Choose a run">
      <Panel className="w-full">
        <div className="flex flex-col gap-3 p-2">
          <div>
            <Label type="formula">Forage run</Label>
            <p className="text-[11px] text-[#3e2731] mt-1">
              Explore the hidden forest, collect all Kale pickups, then claim
              zone loot. Entry fees are paid when you start.
            </p>
          </div>

          {(["meadow", "forest", "mystio"] as const).map((zone) => {
            const unlocked =
              zone === "meadow"
                ? s.meadowUnlocked
                : zone === "forest"
                  ? s.forestUnlocked
                  : s.mystioUnlocked;
            const cost = RUN_COST_KALE[zone];
            const canRun = unlocked && canAffordRun(zone, s);
            const zoneIcon =
              zone === "meadow"
                ? KALE_KINGS_ASSETS.mix
                : zone === "forest"
                  ? KALE_KINGS_ASSETS.magical
                  : KALE_KINGS_ASSETS.golden;

            return (
              <div
                key={zone}
                className="rounded border border-black/10 bg-black/[0.04] p-2 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <img
                    src={zoneIcon}
                    alt=""
                    width={32}
                    height={32}
                    className="[image-rendering:pixelated] object-contain shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3e2731]">
                      {ZONE_LABEL[zone]}
                    </p>
                    <p className="text-[10px] text-[#3e2731]/80">
                      {zone === "meadow" && "Loot: 1–5 Magical Kale"}
                      {zone === "forest" &&
                        "Loot: 1–10 Magical, 0–1 Golden Kale"}
                      {zone === "mystio" && "Loot: 0–3 Golden Kale"}
                    </p>
                    <p className="text-[10px] text-[#3e2731]/70 mt-0.5 flex items-center gap-1">
                      <img
                        src={KALE_KINGS_ASSETS.kale}
                        alt=""
                        width={12}
                        height={12}
                        className="[image-rendering:pixelated]"
                      />
                      <span>
                        Entry: <strong>{cost}</strong> Kale
                      </span>
                    </p>
                  </div>
                </div>

                {unlocked ? (
                  <Button
                    type="button"
                    disabled={!canRun}
                    className="w-full"
                    onClick={() => startRun(zone)}
                  >
                    {canRun ? `Start run (${cost} Kale)` : "Not enough Kale"}
                  </Button>
                ) : zone === "forest" ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#3e2731]/85">
                      Unlock with{" "}
                      <strong>{UNLOCK_FOREST_MAGICAL}</strong> Magical Kale.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      disabled={s.magicalKale < UNLOCK_FOREST_MAGICAL}
                      onClick={() => {
                        playSfx("button");
                        unlockForest();
                      }}
                    >
                      {s.magicalKale < UNLOCK_FOREST_MAGICAL
                        ? `Need ${UNLOCK_FOREST_MAGICAL} Magical`
                        : `Unlock Forest (${UNLOCK_FOREST_MAGICAL} Magical)`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#3e2731]/85">
                      Unlock with{" "}
                      <strong>{UNLOCK_MYSTIO.magical}</strong> Magical +{" "}
                      <strong>{UNLOCK_MYSTIO.golden}</strong> Golden Kale.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      disabled={
                        s.magicalKale < UNLOCK_MYSTIO.magical ||
                        s.goldenKale < UNLOCK_MYSTIO.golden
                      }
                      onClick={() => {
                        playSfx("button");
                        unlockMystio();
                      }}
                    >
                      {s.magicalKale < UNLOCK_MYSTIO.magical ||
                      s.goldenKale < UNLOCK_MYSTIO.golden
                        ? "Not enough to unlock"
                        : "Unlock Mystio"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Panel>
    </KingdomModalShell>
  );
};
