export type MinigameSessionResponse = {
  farm: {
    balance: string;
    bumpkin?: unknown;
  };
  playerEconomy: {
    balances: Record<string, number>;
    generating: Record<
      string,
      {
        outputToken: string;
        startedAt: number;
        completesAt: number;
        requires?: string;
      }
    >;
    activity: number;
    dailyActivity: { date: string; count: number };
    /** Present when API returns the extended player economy payload. */
    dailyMinted?: { utcDay: string; minted: Record<string, number> };
  };
  actions: Record<string, unknown>;
};

export type MinigameActionResponse = {
  playerEconomy: MinigameSessionResponse["playerEconomy"];
  generatorJobId?: string;
};

export type BootstrapContext = {
  id: number;
  jwt: string;
  /**
   * Must match `portalId` inside the portal JWT (client-side; Minigames API reads
   * portal id from the Bearer token for session + actions).
   */
  portalId: string;
  farm: MinigameSessionResponse["farm"];
  playerEconomy: MinigameSessionResponse["playerEconomy"];
  actions: Record<string, unknown>;
};
