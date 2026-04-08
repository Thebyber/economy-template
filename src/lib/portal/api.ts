import type { MinigameSessionResponse, MinigameActionResponse } from "./types";
import { getMinigamesApiUrl } from "./url";

export async function getPlayerEconomySession({
  token,
}: {
  token: string;
}): Promise<MinigameSessionResponse> {
  const base = getMinigamesApiUrl();
  if (!base) {
    throw new Error(
      "No Minigames API URL (set VITE_MINIGAMES_API_URL or pass minigamesApiUrl=…)",
    );
  }

  const url = new URL("/data", `${base}/`);
  url.searchParams.set("type", "session");

  const response = await window.fetch(url.toString(), {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const bodyText = await response.text();
  let parsed: { data?: MinigameSessionResponse; error?: string } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(bodyText || `Invalid JSON (${response.status})`);
  }

  if (response.status >= 400) {
    throw new Error(
      typeof parsed.error === "string"
        ? parsed.error
        : bodyText || `Minigame session ${response.status}`,
    );
  }

  if (!parsed.data) {
    throw new Error("Invalid session response (missing data)");
  }

  return parsed.data;
}

export async function postPlayerEconomyAction({
  token,
  action,
  itemId,
  amounts,
}: {
  token: string;
  action: string;
  itemId?: string;
  amounts?: Record<string, number>;
}): Promise<MinigameActionResponse> {
  const base = getMinigamesApiUrl();
  if (!base) {
    throw new Error(
      "No Minigames API URL (set VITE_MINIGAMES_API_URL or pass minigamesApiUrl=…)",
    );
  }

  const response = await window.fetch(`${base}/action`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: "minigame.action",
      action,
      ...(itemId !== undefined ? { itemId } : {}),
      ...(amounts !== undefined ? { amounts } : {}),
    }),
  });

  const bodyText = await response.text();
  let envelope: {
    data?: MinigameActionResponse;
    error?: string;
  } = {};
  try {
    envelope = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(bodyText || `Invalid JSON (${response.status})`);
  }

  if (response.status >= 400) {
    throw new Error(envelope.error || `Action failed (${response.status})`);
  }

  if (!envelope.data) {
    throw new Error("Invalid action response (missing data)");
  }

  return envelope.data;
}
