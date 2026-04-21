import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";
import { MmoRoomProvider, useMmoRoom } from "lib/mmo";
import { closePortal, useMinigameSession } from "lib/portal";
import { tokenUriBuilder } from "lib/utils/tokenUriBuilder";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { LOBBY_SCENE_SLUG } from "./LobbyScene";
import { LobbyGame } from "./LobbyGame";
import { BlacksmithModal } from "./components/BlacksmithModal";
import { LobbyInventoryModal } from "./components/LobbyInventoryModal";

const FACTION_ITEMS: Record<string, string> = {
  "Sunflorian Armor": "sunflorians",
  "Sunflorian Pants": "sunflorians",
  "Sunflorian Helmet": "sunflorians",
  "Sunflorian Shield": "sunflorians",
  "Sunflorian Sabatons": "sunflorians",
  "Sunflorian Sword": "sunflorians",
  "Sunflorian Crown": "sunflorians",
  "Sunflorian Quiver": "sunflorians",
  "Sunflorian Medallion": "sunflorians",
  "Goblin Armor": "goblins",
  "Goblin Pants": "goblins",
  "Goblin Helmet": "goblins",
  "Goblin Shield": "goblins",
  "Goblin Sabatons": "goblins",
  "Goblin Sword": "goblins",
  "Goblin Crown": "goblins",
  "Goblin Quiver": "goblins",
  "Goblin Medallion": "goblins",
  "Bumpkin Armor": "bumpkins",
  "Bumpkin Pants": "bumpkins",
  "Bumpkin Helmet": "bumpkins",
  "Bumpkin Shield": "bumpkins",
  "Bumpkin Sabatons": "bumpkins",
  "Bumpkin Sword": "bumpkins",
  "Bumpkin Crown": "bumpkins",
  "Bumpkin Quiver": "bumpkins",
  "Bumpkin Medallion": "bumpkins",
  "Nightshade Armor": "nightshades",
  "Nightshade Pants": "nightshades",
  "Nightshade Helmet": "nightshades",
  "Nightshade Shield": "nightshades",
  "Nightshade Sabatons": "nightshades",
  "Nightshade Sword": "nightshades",
  "Nightshade Crown": "nightshades",
  "Nightshade Quiver": "nightshades",
  "Nightshade Medallion": "nightshades",
};

function detectFaction(equipped: Record<string, string> | undefined): string | undefined {
  if (!equipped) return undefined;
  for (const value of Object.values(equipped)) {
    const faction = FACTION_ITEMS[value];
    if (faction) return faction;
  }
  return undefined;
}

function buildBumpkinJoin(bumpkin: unknown): GuestBumpkinJoin {
  const b = bumpkin as { equipped?: Record<string, string>; experience?: number; id?: number } | undefined;
  const equipped = b?.equipped;

  if (!equipped) return createDefaultGuestBumpkin();

  const parts: BumpkinParts = {
    background: equipped.background as BumpkinParts["background"],
    body: equipped.body as BumpkinParts["body"],
    hair: equipped.hair as BumpkinParts["hair"],
    shirt: equipped.shirt as BumpkinParts["shirt"],
    pants: equipped.pants as BumpkinParts["pants"],
    shoes: equipped.shoes as BumpkinParts["shoes"],
    tool: equipped.tool as BumpkinParts["tool"],
    hat: equipped.hat as BumpkinParts["hat"],
    necklace: equipped.necklace as BumpkinParts["necklace"],
    secondaryTool: equipped.secondaryTool as BumpkinParts["secondaryTool"],
    coat: equipped.coat as BumpkinParts["coat"],
    onesie: equipped.onesie as BumpkinParts["onesie"],
    suit: equipped.suit as BumpkinParts["suit"],
    wings: equipped.wings as BumpkinParts["wings"],
    dress: equipped.dress as BumpkinParts["dress"],
    beard: equipped.beard as BumpkinParts["beard"],
    aura: equipped.aura as BumpkinParts["aura"],
  };

  return {
    equipped: {
      background: equipped.background ?? "",
      body: equipped.body ?? "",
      hair: equipped.hair ?? "",
      shoes: equipped.shoes ?? "",
      pants: equipped.pants ?? "",
      tool: equipped.tool ?? "",
      shirt: equipped.shirt ?? "",
      coat: equipped.coat ?? "",
      onesie: equipped.onesie ?? "",
      suit: equipped.suit ?? "",
      dress: equipped.dress ?? "",
      hat: equipped.hat ?? "",
      wings: equipped.wings ?? "",
      beard: equipped.beard ?? "",
      aura: equipped.aura ?? "",
    },
    experience: b?.experience ?? 0,
    id: b?.id ?? 0,
    skills: {},
    tokenUri: tokenUriBuilder(parts),
    achievements: {},
  };
}

const LobbyPageInner: React.FC = () => {
  const { farm, farmId } = useMinigameSession();
  const { room, phase, retry } = useMmoRoom();
  const navigate = useNavigate();
  const [showBlacksmith, setShowBlacksmith] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  if (phase === "loading" || phase === "idle") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-stone-200 text-sm">Connecting to lobby...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
        <Panel className="max-w-md w-full">
          <div className="p-3 flex flex-col gap-2">
            <Label type="danger">Connection failed</Label>
            <p className="text-sm text-stone-600">
              Could not connect to the lobby server.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={retry}>Try again</Button>
              <Button onClick={() => navigate("/home")}>Play Solo</Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  const username = farm?.username ?? String(farmId);
  const faction = farm?.faction ?? detectFaction((farm?.bumpkin as { equipped?: Record<string, string> } | undefined)?.equipped);

  return (
    <div className="fixed inset-0 bg-black">
      <LobbyGame
        bumpkin={farm?.bumpkin}
        farmId={farmId}
        username={username}
        faction={faction}
        room={room}
        onEnterDoor={() => navigate("/home")}
        onBack={() => closePortal(navigate)}
        onOpenBlacksmith={() => setShowBlacksmith(true)}
        onOpenInventory={() => setShowInventory(true)}
      />
      {showBlacksmith && <BlacksmithModal onClose={() => setShowBlacksmith(false)} />}
      {showInventory && <LobbyInventoryModal onClose={() => setShowInventory(false)} />}
    </div>
  );
};

export const LobbyPage: React.FC = () => {
  const { farm, farmId } = useMinigameSession();

  const connectOptions = useMemo(
    () => {
      return {
        sceneId: LOBBY_SCENE_SLUG,
        farmId,
        username: farm?.username ?? String(farmId),
        bumpkin: buildBumpkinJoin(farm?.bumpkin),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [farmId],
  );

  return (
    <MmoRoomProvider connectOptions={connectOptions}>
      <LobbyPageInner />
    </MmoRoomProvider>
  );
};
