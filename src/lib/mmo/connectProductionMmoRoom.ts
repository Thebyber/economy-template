import { Client, type Room } from "colyseus.js";
import { CONFIG } from "lib/config";
import { createDefaultGuestBumpkin } from "./defaultGuestBumpkin";
import { getOrCreateGuestFarmId } from "./guestIdentity";
import { MMO_PRODUCTION_PLAZA_ROOM } from "./servers";
import type { GuestBumpkinJoin } from "./types";

export type ConnectProductionMmoRoomOptions = {
  /**
   * Minigame / economy slug — sent as Colyseus `sceneId` so only clients using the same
   * slug see each other (isolated from main-game `plaza`, etc.).
   */
  sceneId: string;
  farmId?: number;
  username?: string;
  bumpkin?: GuestBumpkinJoin;
  spawn?: { x: number; y: number };
  experience?: number;
};

export type ProductionMmoConnection = {
  client: Client;
  room: Room;
  serverId: typeof MMO_PRODUCTION_PLAZA_ROOM;
};

/**
 * Connects to production MMO on the fixed **Kale** shard (`sunflorea_kale`). No JWT required.
 */
export async function connectProductionMmoRoom(
  options: ConnectProductionMmoRoomOptions,
): Promise<ProductionMmoConnection> {
  const client = new Client(CONFIG.MMO_PRODUCTION_ROOM_URL);

  const farmId = options.farmId ?? getOrCreateGuestFarmId();
  const bumpkin = options.bumpkin ?? createDefaultGuestBumpkin();
  const spawn = options.spawn ?? { x: 400, y: 280 };

  const room = await client.joinOrCreate(MMO_PRODUCTION_PLAZA_ROOM, {
    jwt: "",
    farmId,
    bumpkin,
    faction: undefined,
    x: spawn.x,
    y: spawn.y,
    sceneId: options.sceneId,
    experience: options.experience ?? 0,
    moderation: { kicked: [], muted: [] },
    username: options.username ?? "Guest",
    totalDeliveries: 0,
    dailyStreak: 0,
    createdAt: Date.now(),
    islandType: "basic",
  });

  return { client, room, serverId: MMO_PRODUCTION_PLAZA_ROOM };
}

export function disconnectProductionMmoRoom(room: Room | undefined): void {
  try {
    room?.leave();
  } catch {
    // ignore
  }
}
