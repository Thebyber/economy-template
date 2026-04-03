import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $kaleKingsState, claimPassiveKale } from "examples/kale-kings/kaleKingsStore";
import { EIGHT_HOURS_MS, GIANT_KALE_GOLDEN_COST, passiveKaleAccrued } from "examples/kale-kings/kaleKingsRules";
import { KingdomModalShell } from "examples/kale-kings/kingdom/KingdomModalShell";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { playSfx } from "lib/audio";

function formatDuration(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

type Props = { open: boolean; onClose: () => void };

export const GiantKaleModal: React.FC<Props> = ({ open, onClose }) => {
  const s = useStore($kaleKingsState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const { periods, kale: passiveReady } = passiveKaleAccrued(
    s.lastPassiveClaimAt,
    s.giantKaleCount,
    now,
  );
  const msUntilNext = Math.max(
    0,
    s.lastPassiveClaimAt + EIGHT_HOURS_MS - now,
  );

  return (
    <KingdomModalShell open={open} onClose={onClose} title="Giant Kale patch">
      <Panel className="w-full border-2 border-[#2e7d32]/40">
        <div className="flex flex-col gap-3 p-2">
          <div className="flex items-center gap-3">
            <img
              src={KALE_KINGS_ASSETS.giant}
              alt=""
              width={56}
              height={56}
              className="[image-rendering:pixelated] object-contain shrink-0 drop-shadow-md"
            />
            <div>
              <Label type="formula">Giant Kale patch</Label>
              <p className="text-[11px] text-[#3e2731] mt-1">
                You have <strong>{s.giantKaleCount}</strong> Giant Kale
                {s.giantKaleCount === 1 ? "" : "s"}. Each produces{" "}
                <strong>1 Kale</strong> every <strong>8 hours</strong>.
              </p>
            </div>
          </div>

          {periods >= 1 ? (
            <Button
              type="button"
              onClick={() => {
                playSfx("button");
                claimPassiveKale();
              }}
            >
              Collect +{passiveReady} Kale
            </Button>
          ) : (
            <p className="text-[11px] text-[#3e2731]">
              Next harvest in <strong>{formatDuration(msUntilNext)}</strong>
            </p>
          )}

          <p className="text-[10px] text-[#3e2731]/75 border-t border-black/10 pt-2">
            Want more passive Kale? Use the <strong>Shop</strong> and spend{" "}
            <strong>{GIANT_KALE_GOLDEN_COST} Golden Kale</strong> for another
            Giant Kale.
          </p>

          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Panel>
    </KingdomModalShell>
  );
};
