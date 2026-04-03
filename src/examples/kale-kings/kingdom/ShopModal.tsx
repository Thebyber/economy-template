import React from "react";
import { useStore } from "@nanostores/react";
import {
  $kaleKingsState,
  buyGiantKale,
} from "examples/kale-kings/kaleKingsStore";
import { GIANT_KALE_GOLDEN_COST } from "examples/kale-kings/kaleKingsRules";
import { KingdomModalShell } from "examples/kale-kings/kingdom/KingdomModalShell";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { playSfx } from "lib/audio";

type Props = { open: boolean; onClose: () => void };

export const ShopModal: React.FC<Props> = ({ open, onClose }) => {
  const s = useStore($kaleKingsState);
  const canBuyGiant = s.goldenKale >= GIANT_KALE_GOLDEN_COST;

  return (
    <KingdomModalShell open={open} onClose={onClose} title="Shop">
      <Panel className="w-full">
        <div className="flex flex-col gap-3 p-2">
          <Label type="default">Kale Kingdom shop</Label>
          <p className="text-[11px] text-[#3e2731]">
            Spend Golden Kale to grow your kingdom.
          </p>

          <div className="flex gap-3 items-start p-2 rounded bg-black/5 border border-black/10">
            <img
              src={KALE_KINGS_ASSETS.giant}
              alt=""
              width={48}
              height={48}
              className="[image-rendering:pixelated] object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3e2731]">
                +1 Giant Kale
              </p>
              <p className="text-[10px] text-[#3e2731]/80 mt-0.5">
                Adds another passive Kale every 8 hours.
              </p>
              <p className="text-[10px] text-[#3e2731]/70 mt-1 flex items-center gap-1">
                <img
                  src={KALE_KINGS_ASSETS.golden}
                  alt=""
                  width={14}
                  height={14}
                  className="[image-rendering:pixelated]"
                />
                <span>
                  <strong>{GIANT_KALE_GOLDEN_COST}</strong> Golden Kale
                </span>
              </p>
              <Button
                type="button"
                className="mt-2 w-full sm:w-auto"
                disabled={!canBuyGiant}
                onClick={() => {
                  playSfx("button");
                  buyGiantKale();
                }}
              >
                Buy
              </Button>
            </div>
          </div>

          <div className="rounded border border-dashed border-[#3e2731]/25 p-3 text-center">
            <p className="text-[10px] text-[#3e2731]/60">
              More upgrades coming soon…
            </p>
          </div>

          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Panel>
    </KingdomModalShell>
  );
};
