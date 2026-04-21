import React, { useEffect, useState } from "react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";
import type { EconomyActionDefinition } from "lib/portal/playerEconomyTypes";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { PIXEL_SCALE } from "lib/constants";
import { DD_ITEM } from "../lib/deepDungeonItemIds";

const ID_TO_IMAGE: Record<string, string> = {
  [DD_ITEM.DEEP_COIN]:          "/world/DeepDungeonAssets/deep_token.png",
  [DD_ITEM.POTION]:             "/world/DeepDungeonAssets/potion.png",
  [DD_ITEM.KEY_CHEST]:          "/world/DeepDungeonAssets/key_chest.png",
  [DD_ITEM.PINK_CRYSTAL_1]:     "/world/DeepDungeonAssets/pink_crystal_1.png",
  [DD_ITEM.PINK_CRYSTAL_2]:     "/world/DeepDungeonAssets/pink_crystal_2.png",
  [DD_ITEM.PINK_CRYSTAL_3]:     "/world/DeepDungeonAssets/pink_crystal_3.png",
  [DD_ITEM.PINK_CRYSTAL_4]:     "/world/DeepDungeonAssets/pink_crystal_4.png",
  [DD_ITEM.PINK_CRYSTAL_5]:     "/world/DeepDungeonAssets/pink_crystal_5.png",
  [DD_ITEM.WHITE_CRYSTAL_1]:    "/world/DeepDungeonAssets/white_crystal_1.png",
  [DD_ITEM.WHITE_CRYSTAL_2]:    "/world/DeepDungeonAssets/white_crystal_2.png",
  [DD_ITEM.WHITE_CRYSTAL_3]:    "/world/DeepDungeonAssets/white_crystal_3.png",
  [DD_ITEM.WHITE_CRYSTAL_4]:    "/world/DeepDungeonAssets/white_crystal_4.png",
  [DD_ITEM.WHITE_CRYSTAL_5]:    "/world/DeepDungeonAssets/white_crystal_5.png",
  [DD_ITEM.BLUE_CRYSTAL_1]:     "/world/DeepDungeonAssets/blue_crystal_1.png",
  [DD_ITEM.BLUE_CRYSTAL_2]:     "/world/DeepDungeonAssets/blue_crystal_2.png",
  [DD_ITEM.BLUE_CRYSTAL_3]:     "/world/DeepDungeonAssets/blue_crystal_3.png",
  [DD_ITEM.BLUE_CRYSTAL_4]:     "/world/DeepDungeonAssets/blue_crystal_4.png",
  [DD_ITEM.BLUE_CRYSTAL_5]:     "/world/DeepDungeonAssets/blue_crystal_5.png",
  [DD_ITEM.PRISMORA_CRYSTAL_1]: "/world/DeepDungeonAssets/prismora_crystal_1.png",
  [DD_ITEM.PRISMORA_CRYSTAL_2]: "/world/DeepDungeonAssets/prismora_crystal_2.png",
  [DD_ITEM.PRISMORA_CRYSTAL_3]: "/world/DeepDungeonAssets/prismora_crystal_3.png",
  [DD_ITEM.PRISMORA_CRYSTAL_4]: "/world/DeepDungeonAssets/prismora_crystal_4.png",
  [DD_ITEM.PRISMORA_CRYSTAL_5]: "/world/DeepDungeonAssets/prismora_crystal_5.png",
};

const REFINE_RECIPES = ["blacksmith_refine", "blacksmith_refine_1", "blacksmith_refine_2", "blacksmith_refine_3"] as const;
const DISMANTLE_RECIPES = ["blacksmith_dismantle", "blacksmith_dismantle_1", "blacksmith_dismantle_2", "blacksmith_dismantle_3"] as const;

function formatDuration(ms: number): string {
  if (ms <= 0) return "Ready!";
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

interface Props {
  onClose: () => void;
}

const RecipeCard: React.FC<{
  recipeId: string;
  action: EconomyActionDefinition;
  playerEconomy: ReturnType<typeof useMinigameSession>["playerEconomy"];
  dispatchAction: ReturnType<typeof useMinigameSession>["dispatchAction"];
  now: number;
}> = ({ recipeId, action, playerEconomy, dispatchAction, now }) => {
  const activeEntry = Object.entries(playerEconomy.generating).find(
    ([, job]) => job.sourceActionId === recipeId,
  );
  const jobId = activeEntry?.[0];
  const job = activeEntry?.[1];
  const isComplete = job ? now >= job.completesAt : false;
  const timeLeft = job ? Math.max(0, job.completesAt - now) : 0;

  const burnEntries = Object.entries(action.burn ?? {});
  const produceEntries = Object.entries(action.produce ?? {});
  const outputTokenId = produceEntries[0]?.[0];
  const collectRule = outputTokenId
    ? (action.collect ?? {})[outputTokenId] as { amount?: number; seconds?: number } | undefined
    : undefined;
  const durationSecs = collectRule?.seconds ?? 0;
  const outputAmount = collectRule?.amount ?? 1;

  const canStart =
    !activeEntry &&
    burnEntries.every(([tokenId, rule]) => {
      const needed = (rule as { amount?: number }).amount ?? 0;
      return (playerEconomy.balances[tokenId] ?? 0) >= needed;
    });

  return (
    <div className="bg-[#ead4aa] border border-[#754733] rounded p-3 flex flex-col gap-3">
      {/* Burn → Get row */}
      <div className="flex items-center justify-center gap-4">
        {/* Burns */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-brown-700 uppercase">{"Burns"}</span>
          {burnEntries.map(([tokenId, rule]) => {
            const needed = (rule as { amount?: number }).amount ?? 0;
            const have = playerEconomy.balances[tokenId] ?? 0;
            const item = ID_TO_IMAGE[tokenId];
            return (
              <div key={tokenId} className="flex items-center gap-1">
                <img
                  src={item}
                  className="w-8 h-8 object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  alt=""
                />
                <span className={`text-xs font-bold ${have >= needed ? "text-green-700" : "text-red-700"}`}>
                  {`${have} / ${needed}`}
                </span>
              </div>
            );
          })}
        </div>

        <span className="text-brown-1100 font-bold text-xl">{"→"}</span>

        {/* Gets */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-brown-700 uppercase">{"Gets"}</span>
          {outputTokenId && (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <img
                  src={ID_TO_IMAGE[outputTokenId]}
                  className="w-8 h-8 object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  alt=""
                />
                <span className="text-xs font-bold text-brown-1100">{`x${outputAmount}`}</span>
              </div>
              <span className="text-[11px] font-bold text-brown-700">
                {durationSecs >= 3600
                  ? `${durationSecs / 3600}h`
                  : `${Math.round(durationSecs / 60)}m`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      {!activeEntry && (
        <Button disabled={!canStart} onClick={() => dispatchAction({ action: recipeId })}>
          {"Start"}
        </Button>
      )}
      {activeEntry && !isComplete && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-brown-700">{formatDuration(timeLeft)}</span>
          <Button disabled>{"In progress..."}</Button>
        </div>
      )}
      {activeEntry && isComplete && (
        <Button onClick={() => jobId && dispatchAction({ collectJobId: jobId })}>
          {"Collect"}
        </Button>
      )}
    </div>
  );
};

export const BlacksmithModal: React.FC<Props> = ({ onClose }) => {
  const { playerEconomy, actions, dispatchAction } = useMinigameSession();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const availableRefine = REFINE_RECIPES.filter(
    (id) => !!(actions as Record<string, EconomyActionDefinition>)[id]
  );
  const availableDismantle = DISMANTLE_RECIPES.filter(
    (id) => !!(actions as Record<string, EconomyActionDefinition>)[id]
  );

  const sharedProps = { playerEconomy, dispatchAction, now };

  return (
    <Modal show>
      <Panel className="relative !p-0" style={{ maxWidth: '350px' }}>
        {/* Contenedor principal con padding y altura fija */}
        <div className="p-3 flex flex-col" style={{ maxHeight: '80vh' }}>
          
          {/* Header Fijo (No hace scroll) */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <Label type="default" className="uppercase">{"Blacksmith"}</Label>
            <img
              src={DD_SUNNYSIDE.icons.close}
              className="cursor-pointer"
              style={{ width: PIXEL_SCALE * 11 }}
              onClick={onClose}
              alt="close"
            />
          </div>

          {/* ÁREA DE SCROLL: Aquí es donde ocurre la magia */}
          <div 
            className="overflow-y-auto scrollable pr-1 custom-scroll" 
            style={{ 
              minHeight: 0, // Obligatorio para que flex-1 funcione
              flex: "1 1 auto" 
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Refine Section */}
              <section>
                <Label type="default" className="uppercase text-[10px] mb-2">{"Refine"}</Label>
                <div className="flex flex-col gap-2">
                  {availableRefine.map((recipeId) => (
                    <RecipeCard
                      key={recipeId}
                      recipeId={recipeId}
                      action={(actions as Record<string, EconomyActionDefinition>)[recipeId]}
                      {...sharedProps}
                    />
                  ))}
                </div>
              </section>

              {/* Dismantle Section */}
              <section>
                <Label type="default" className="uppercase text-[10px] mb-2">{"Dismantle"}</Label>
                <div className="flex flex-col gap-2">
                  {availableDismantle.map((recipeId) => (
                    <RecipeCard
                      key={recipeId}
                      recipeId={recipeId}
                      action={(actions as Record<string, EconomyActionDefinition>)[recipeId]}
                      {...sharedProps}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Panel>
    </Modal>
  );
};