/** Minimal English copy for the Chicken Rescue template example. */
export const EN_STRINGS: Record<string, string> = {
  error: "Error",
  "error.wentWrong": "Something went wrong. Please try again.",
  retry: "Retry",
  "session.expired": "Session expired!",
  close: "Close",
  loading: "Loading…",
  continue: "Continue",
  exit: "Exit",
  "last.updated": "Last updated:",
  "base.far.away": "You are too far away",
  "base.iam.far.away": "I am too far away",
  "minigame.chickenRescue": "Minigame - Chicken Rescue",
  "minigame.chickenRescueBumpkinDialogue":
    "If you want to play in my fields.\nYou must pay me coins.\nIt costs one coin to enter and catch my chooks.",
  "minigame.chickenRescue.collectChooksTitle": "Collect chooks",
  "minigame.chickenRescue.welcomeBody":
    "Pssst, are you looking for chooks? Use your worms and chicken feet to attract and catch them. Shops and wormeries are in Sunflower Land.",
  "minigame.chickenRescue.freeWormsTitle": "Daily free worms",
  "minigame.chickenRescue.freeWormsBodyInstant":
    "Grab your daily gift — we’ll add 3 worms to your balance and sync with the server.",
  "minigame.chickenRescue.freeWormsBodyTimed":
    "This starts your daily worm drop. After about {{hours}} hours, collect 3 worms from your Wormery (production).",
  "minigame.chickenRescue.freeWormsClaim": "Claim 3 worms",
  "minigame.chickenRescue.freeWormsSkip": "Continue without claiming",
  "minigame.chickenRescue.gameOver": "Game over",
  "minigame.chickenRescue.resultsFoundChooks":
    "Congratulations, you found some chooks.",
  "minigame.chickenRescue.resultsNoChooks":
    "Bad luck, you didn't catch any chooks.",
  "minigame.chickenRescue.foundChooksLine": "You found {{count}} chooks.",
  "minigame.chickenRescue.foundGoldenChooksLine":
    "You found {{count}} golden chooks.",
  "minigame.swipeToMove": "Swipe to move around",
  "minigame.arrowKeysToMove": "Use WASD or arrow keys to move around",
  "minigame.noCoinsRemaining": "No worms remaining",
  "minigame.coinsRemaining": "worms left",
  "minigame.shopBack": "Back",
  "minigame.shopConfirm": "Confirm",

  buy: "Buy",
  ok: "OK",
  start: "Start",
  collect: "Collect",
  balance: "Balance",
  inventory: "Inventory",
  requires: "Requires",
  "welcome.label": "Welcome",
  "detail.basket.empty": "Your basket is empty.",
  dismiss: "Dismiss",

  "minigame.uiResources.emptyActions":
    "This session has no economy actions yet. Add rules in the minigame editor or use the offline stub in UiResourcesApp.",

  "minigame.dashboard.shop": "Shop",
  "minigame.dashboard.priceLabel": "Price",
  "minigame.dashboard.shopAlreadyPurchased": "Already purchased the maximum for this item.",
  "minigame.dashboard.actionFailed": "Action failed. Please try again.",
  "minigame.dashboard.welcomeFallback":
    "Use the shop and generators shown here. Your progress syncs through the Minigames API when configured.",

  "minigame.dashboard.production.collectResolving": "Resolving collect…",
  "minigame.dashboard.production.collectYouWon": "You received:",
  "minigame.dashboard.production.collectDone": "Done",
  "minigame.dashboard.production.openRecipesAria": "Open recipes",
  "minigame.dashboard.production.collectFromBuildingAria": "Collect from building",
  "minigame.dashboard.production.startRun": "Start a run at {{building}}.",
  "minigame.dashboard.production.duration": "Duration:",
  "minigame.dashboard.production.dropOddsTitle": "Possible drops",
  "minigame.dashboard.production.dropOddsLine":
    "{{percent}} chance: +{{amount}} {{name}}",
  "minigame.dashboard.production.producesWhenComplete": "When complete you get:",
  "minigame.dashboard.production.uses": "Uses",
  "minigame.dashboard.production.noExtraResources": "No extra resources required.",
  "minigame.dashboard.production.producing":
    "Producing {{output}} at {{building}}.",
  "minigame.dashboard.production.readyCollect": "{{building}} is ready to collect.",
  "minigame.dashboard.production.readyIn": "Ready in {{time}}.",
  "minigame.dashboard.production.noActive": "No active job at {{building}}.",
  "minigame.dashboard.production.collectYour": "You will collect:",
  "minigame.dashboard.production.nothingToCollect": "Nothing to collect.",
  "minigame.dashboard.production.whatToProduce": "What do you want to produce?",
  "minigame.dashboard.production.mysteryDropTitle": "Mystery drop",
  "minigame.dashboard.production.tapToCollect": "Tap to collect",

  // ── Deep Dungeon ────────────────────────────────────────────────────────────
  "deepdungeon.guide": "Dungeon Guide",
  "deepdungeon.instructions": "Instructions",
  "deepdungeon.enemies": "Enemies",
  "deepdungeon.stats": "Stats",
  "deepdungeon.points": "Points",
  "deepdungeon.guideDescription": "{{description}}",

    
  "deepdungeon.instructions1": "Explore the Deep Dungeon, but watch your energy!",
  "deepdungeon.instructions2": "You start with 100 energy, and every move will cost you 1 energy.",
  "deepdungeon.instructions3": "Earn points by defeating enemies, clearing dungeon floors, or mining crystals (Pickaxe required).",
  "deepdungeon.instructions4": "Defeating enemies grants random drops, such as Pickaxes or combat stat boosts.",
  "deepdungeon.instructions5": "Mine crystals to recover energy and survive longer in the depths. You can find 3 pickaxes on each map",
  "deepdungeon.instructions6": "When moving to the next map via the staircase, you win 15 energy and you can choose 1 power-up from 3 random cards.",
  

  "deepdungeon.stats1": "Energy is the player's life. If your energy drops to 0, you will lose the run and all progress made in that run.",
  "deepdungeon.stats2": "Life of the enemy.",
  "deepdungeon.stats3": "Attack of the enemy/player.",
  "deepdungeon.stats4": "Area of Effect of the enemy's attack. If you get close to an enemy with an AoE attack.",
  "deepdungeon.stats5": "Defense of the enemy/player. This reduces the damage taken from attacks.",
  "deepdungeon.stats6": "Critical hit chance of the enemy/player. This is the chance to deal a critical hit. If you're lucky, the final damage is multiplied by 2.",
  "deepdungeon.stats7": "Damage formula => Life = Attack - Defense ",
  "deepdungeon.stats8": "Critical hit => Life = (Attack * 2) - Defense",
  
  "deepdungeon.enemies1": "Slime: A basic enemy very gelatinous.",
  "deepdungeon.enemies2": "Skeleton: A basic enemy that can be defeated with a few hits.",
  "deepdungeon.enemies3": "Knight: A stronger enemy that requires more hits to defeat.",
  "deepdungeon.enemies4": "Frankenstein: A powerful enemy that can deal heavy damage. If you get close, it will perform an area-of-effect lightning attack.",
  "deepdungeon.enemies5": "Devil: The strongest enemy in the dungeon, capable of dealing significant damage. If you get close, it will attack you with a burst of fire.",
  
  "deepdungeon.points1": "Pink Crystal: Tier 1 grants 100 points, increasing by 100 points per tier, up to 500 points at Tier 5.",
  "deepdungeon.points2": "White Crystal: Tier 1 grants 150 points, increasing by 150 points per tier, up to 750 points at Tier 5.",
  "deepdungeon.points3": "Blue Crystal: Tier 1 grants 200 points, increasing by 200 points per tier, up to 1000 points at Tier 5.",
  "deepdungeon.points4": "Prismora Crystal: Tier 1 grants 250 points, increasing by 250 points per tier, up to 1250 points at Tier 5.",
  "deepdungeon.points5": "Slime: Defeating it grants 100 points.",
  "deepdungeon.points6": "Skeleton: Defeating it grants 200 points.",
  "deepdungeon.points7": "Knight: Defeating it grants 400 points.",
  "deepdungeon.points8": "Frankenstein: Defeating it grants 600 points.",
  "deepdungeon.points9": "Devil: Defeating it grants 1000 points.",
  "deepdungeon.points10": "Advancing to the next map grants 50 points, if you reach map 5 you will earn 250 points",
  "deepdungeon.points11": "Player XP is earned during a run: +5 per crystal mined, +10 per enemy killed.",
  
  "deepdungeon.move": "Move",
  "deepdungeon.move1": "Computer version: WASD or arrow keys or swipe to move, mine or attack",
  "deepdungeon.move2": "Mobile version: Swipe to move, mine or attack",
};

function interpolate(
  template: string,
  args?: Record<string, string | number>,
): string {
  if (!args) return template;
  let out = template;
  for (const [k, v] of Object.entries(args)) {
    out = out.split(`{{${k}}}`).join(String(v));
  }
  return out;
}

export function formatString(
  key: string,
  args?: Record<string, string | number>,
): string {
  const raw = EN_STRINGS[key] ?? key;
  return interpolate(raw, args);
}
