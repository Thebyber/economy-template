const FARM_STORAGE_KEY = "template_mmo_guest_farm_id";

/** Stable per-tab guest farm id so reconnects replace the same slot server-side. */
export function getOrCreateGuestFarmId(): number {
  try {
    const existing = sessionStorage.getItem(FARM_STORAGE_KEY);
    if (existing) {
      const n = Number(existing);
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
    // High range unlikely to collide with real farm ids from on-chain farms.
    const next = 2_000_000_000 + Math.floor(Math.random() * 99_000_000);
    sessionStorage.setItem(FARM_STORAGE_KEY, String(next));
    return next;
  } catch {
    return 2_000_000_000 + Math.floor(Math.random() * 99_000_000);
  }
}
