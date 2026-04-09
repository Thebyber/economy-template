import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Client, Room } from "colyseus.js";
import {
  connectProductionMmoRoom,
  disconnectProductionMmoRoom,
  type ConnectProductionMmoRoomOptions,
} from "./connectProductionMmoRoom";
import type { MmoProductionPlazaRoomName } from "./types";

export type MmoRoomPhase = "idle" | "loading" | "connected" | "error";

export type MmoRoomContextValue = {
  phase: MmoRoomPhase;
  error: string | null;
  client: Client | null;
  room: Room | null;
  serverId: MmoProductionPlazaRoomName | null;
  /** Colyseus `sceneId` / minigame slug passed to `connectProductionMmoRoom`. */
  sceneId: string | null;
  /** Incremented on failure so `useEffect` can retry. */
  retry: () => void;
};

const MmoRoomContext = createContext<MmoRoomContextValue | null>(null);

export type MmoRoomProviderProps = {
  children: React.ReactNode;
  /** Passed through to `connectProductionMmoRoom` on each attempt (must include `sceneId` slug). */
  connectOptions: ConnectProductionMmoRoomOptions;
};

/**
 * Loads a production Colyseus plaza room once on mount (no xstate).
 * Consumers read `phase` / `room` and pass `room` into Phaser via `game.registry`.
 */
export const MmoRoomProvider: React.FC<MmoRoomProviderProps> = ({
  children,
  connectOptions,
}) => {
  const connectOptionsRef = useRef(connectOptions);
  connectOptionsRef.current = connectOptions;

  const [phase, setPhase] = useState<MmoRoomPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [serverId, setServerId] = useState<MmoProductionPlazaRoomName | null>(
    null,
  );
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let activeRoom: Room | undefined;

    setPhase("loading");
    setError(null);

    (async () => {
      try {
        const opts = connectOptionsRef.current;
        const result = await connectProductionMmoRoom(opts);
        if (cancelled) {
          disconnectProductionMmoRoom(result.room);
          return;
        }
        activeRoom = result.room;
        setClient(result.client);
        setRoom(result.room);
        setServerId(result.serverId);
        setSceneId(opts.sceneId);
        setPhase("connected");
      } catch (e) {
        if (cancelled) return;
        setClient(null);
        setRoom(null);
        setServerId(null);
        setSceneId(null);
        setPhase("error");
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      disconnectProductionMmoRoom(activeRoom);
      setClient(null);
      setRoom(null);
      setServerId(null);
      setSceneId(null);
    };
  }, [attempt]);

  const value = useMemo<MmoRoomContextValue>(
    () => ({
      phase,
      error,
      client,
      room,
      serverId,
      sceneId,
      retry,
    }),
    [phase, error, client, room, serverId, sceneId, retry],
  );

  return (
    <MmoRoomContext.Provider value={value}>{children}</MmoRoomContext.Provider>
  );
};

export function useMmoRoom(): MmoRoomContextValue {
  const ctx = useContext(MmoRoomContext);
  if (!ctx) {
    throw new Error("useMmoRoom must be used within MmoRoomProvider");
  }
  return ctx;
}
