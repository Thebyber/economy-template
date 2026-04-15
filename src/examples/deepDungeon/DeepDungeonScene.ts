import { BaseScene } from "./world/scenes/BaseScene";
import type { SceneId } from "./world/sceneIds";
import type { DeepDungeonPlayerStats } from "./lib/deepDungeonLifecycle";
import { GridMovement } from "./lib/GridMovement";
import { EnemyType } from "./lib/Enemies";
import { EnemyContainer } from "./containers/EnemyContainer";
import { PickaxeContainer } from "./containers/PickaxeContainer";
import { TrapContainer } from "./containers/TrapContainer";
import { StairContainer } from "./containers/StairContainer";
import { CrystalContainer } from "./containers/CrystalContainer";
import type { BumpkinContainer } from "./world/containers/BumpkinContainer";
import {
  AnimationKeys,
  CRYSTAL_DROP_TABLE,
  DROP_ITEMS_CONFIG,
  PORTAL_NAME,
  LEVEL_DESIGNS,
  LEVEL_MAPS,
  type Card,
} from "./DeepDungeonConstants";

// ── Types ────────────────────────────────────────────────────────────────────

type CrystalType = "pink" | "white" | "blue" | "prismora";

/** Stats kept locally by the scene for the duration of one run. */
export interface DeepDungeonRunStats {
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  criticalChance: number;
  inventory: { pickaxe: number };
  currentLevel: number;
}

/** Callbacks injected from React via game.registry ("phaserApi"). */
export interface DeepDungeonPhaserApi {
  /** Called when the run ends (death). React dispatches GAMEOVER to the API. */
  onGameOver: () => void;
  /** Called when the player reaches the stairs to the next floor. */
  onNextLevel: (level: number) => void;
  /** Called to open the card selector modal in React. */
  onOpenCardSelector: () => void;
  /** Called every time stats change (energy, pickaxes…) so the HUD can re-render. */
  onStatsChanged: (stats: DeepDungeonRunStats) => void;
  /** Called when a crystal is mined (to track for GAMEOVER payload). */
  onCrystalMined: (crystalKey: string) => void;
  /** Called when an enemy is killed (to track for GAMEOVER payload). */
  onEnemyKilled: (enemyType: EnemyType) => void;
}

// ── Scene ────────────────────────────────────────────────────────────────────

export class DeepDungeonScene extends BaseScene {
  sceneId = PORTAL_NAME as SceneId;

  // Phaser game objects
  private gridMovement?: GridMovement;
  public enemies: EnemyContainer[] = [];
  private traps: TrapContainer[] = [];
  public crystals: CrystalContainer[] = [];
  private energyOrbsGroup!: Phaser.Physics.Arcade.Group;
  private darknessMask?: Phaser.GameObjects.RenderTexture;
  private visionCircle?: Phaser.GameObjects.Graphics;
  private backgroundMusic!: Phaser.Sound.BaseSound;

  // Level state
  private currentLevel: number = 1;
  private isTransitioning = false;
  private occupiedTiles: Set<string> = new Set();
  public groundLayer: any;
  public wallLayer: any;

  // Input
  private playerKeys?: Record<string, Phaser.Input.Keyboard.Key>;
  private swipeLeft = false;
  private swipeRight = false;
  private swipeUp = false;
  private swipeDown = false;
  private _lastFogX = -1;
  private _lastFogY = -1;

  // Run stats — local mutable copy, updated during gameplay
  private _stats!: DeepDungeonRunStats;

  // ── Accessors ──────────────────────────────────────────────────────────────

  private get phaserApi(): DeepDungeonPhaserApi | undefined {
    return this.registry.get("phaserApi") as DeepDungeonPhaserApi | undefined;
  }

  public getStats(): DeepDungeonRunStats {
    return this._stats;
  }

  private updateStats(partial: Partial<DeepDungeonRunStats>) {
    this._stats = { ...this._stats, ...partial };
    this.phaserApi?.onStatsChanged(this._stats);
  }

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        imageKey: "Tileset-deep-dungeon",
        json: undefined,
      },
    });
  }

  // ── Override BaseScene map init (margin/spacing differ from Sunnyside V3) ──

  public initialiseMap() {
    this.map = this.make.tilemap({ key: PORTAL_NAME as string });

    const tileset = this.map.addTilesetImage(
      "Sunnyside V3",          // name as it appears in the Tiled JSON
      "Tileset-deep-dungeon",  // texture key loaded in preload()
      16,
      16,
      0,  // margin  (deep-dungeon tileset has no margin)
      0,  // spacing (deep-dungeon tileset has no spacing)
    ) as Phaser.Tilemaps.Tileset;

    this.colliders = this.add.group();

    // Create all tile layers (Wall, Ground, Water, etc.)
    this.map.layers.forEach((layerData) => {
      const layer = this.map.createLayer(layerData.name, [tileset], 0, 0);
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });

    this.physics.world.setBounds(
      0,
      0,
      this.map.width * 16,
      this.map.height * 16,
    );
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  init(data: { level?: number; stats?: DeepDungeonRunStats }) {
    this.currentLevel = data?.level ?? 1;
    this.isTransitioning = false;

    // Accept initial stats from React (first level) or carry them over (next level)
    if (data?.stats) {
      this._stats = { ...data.stats, currentLevel: this.currentLevel };
    }

    if (this.cache.tilemap.has("deep-dungeon")) {
      this.cache.tilemap.remove("deep-dungeon");
    }
  }

  preload() {
    const mapIndex = ((this.currentLevel - 1) % 10) + 1;
    this.load.tilemapTiledJSON("deep-dungeon", `world/DeepDungeonAssets/map${mapIndex}.json`);
    this.load.image("Tileset-deep-dungeon", "world/DeepDungeonAssets/Tileset-deep-dungeon.png");

    // Crystals
    ["pink", "white", "blue", "prismora"].forEach((tipo) => {
      for (let i = 1; i <= 5; i++) {
        this.load.image(`${tipo}_crystal_${i}`, `world/DeepDungeonAssets/${tipo}_crystal_${i}.png`);
      }
    });

    super.preload();

    this.load.image("stairs", "world/DeepDungeonAssets/Stairs.png");

    // Audio
    this.load.audio("backgroundMusic", "/world/DeepDungeonAssets/backgroundMusic.wav");
    this.load.audio("sword_attack", "/world/DeepDungeonAssets/sword_attack.mp3");
    this.load.audio("swimming", "/world/DeepDungeonAssets/swimming.mp3");
    this.load.audio("dead_bumpkin", "/world/DeepDungeonAssets/dead_bumpkin.mp3");
    this.load.audio("skeleton_attack", "/world/DeepDungeonAssets/skeleton_attack.mp3");
    this.load.audio("knight_attack", "/world/DeepDungeonAssets/knight_attack.mp3");
    this.load.audio("frankenstein_attack", "/world/DeepDungeonAssets/frankenstein_attack.wav");
    this.load.audio("frankenstein_attackAoE", "/world/DeepDungeonAssets/frankenstein_attackAoE.mp3");
    this.load.audio("devil_attack", "/world/DeepDungeonAssets/devil_attack.wav");
    this.load.audio("devil_attackAoE", "/world/DeepDungeonAssets/devil_attackAoE.wav");
    this.load.audio("slime_attack", "/world/DeepDungeonAssets/slime_attack.mp3");
    this.load.audio("dead_enemies", "/world/DeepDungeonAssets/dead_enemies.mp3");
    this.load.audio("spikes_trap", "/world/DeepDungeonAssets/spikes_trap.mp3");
    this.load.audio("mine_crystal", "/world/DeepDungeonAssets/mine_crystal.mp3");
    this.load.audio("next_level", "/world/DeepDungeonAssets/next_level.mp3");
    this.load.audio("card_sound", "/world/DeepDungeonAssets/card_sound.mp3");
    this.load.audio("reroll_cards", "/world/DeepDungeonAssets/reroll_cards.mp3");
    this.load.audio("win_energy", "/world/DeepDungeonAssets/win_energy.mp3");
    this.load.audio("win_item", "/world/DeepDungeonAssets/win_item.mp3");

    // Sprites
    this.load.image("heart_icon", "world/DeepDungeonAssets/heart.png");
    this.load.image("lightning", "world/DeepDungeonAssets/lightning.png");
    this.load.image("sword", "world/DeepDungeonAssets/sword.png");
    this.load.image("shield", "world/DeepDungeonAssets/shield.png");
    this.load.image("crit", "world/DeepDungeonAssets/crit.png");
    this.load.image("pickaxe", "world/DeepDungeonAssets/pickaxe.png");

    this.load.spritesheet("spikes", "world/DeepDungeonAssets/spikes.png", { frameWidth: 96, frameHeight: 64 });
    this.load.spritesheet("spikes2", "world/DeepDungeonAssets/spikes2.png", { frameWidth: 96, frameHeight: 64 });
    this.load.spritesheet("lightning5", "world/DeepDungeonAssets/lightning5.png", { frameWidth: 12, frameHeight: 12 });
    this.load.spritesheet("lightning10", "world/DeepDungeonAssets/lightning10.png", { frameWidth: 16, frameHeight: 12 });
    this.load.spritesheet("energy_big", "world/DeepDungeonAssets/lightning10.png", { frameWidth: 16, frameHeight: 12 });
    this.load.spritesheet("energy_small", "world/DeepDungeonAssets/lightning5.png", { frameWidth: 12, frameHeight: 12 });
    this.load.spritesheet("pickaxe_sprite", "world/DeepDungeonAssets/pickaxe.png", { frameWidth: 13, frameHeight: 13 });

    // Enemies
    const enemies = ["skeleton", "slime", "knight", "frankenstein", "devil"];
    const anims = ["idle", "hurt", "walk", "attack", "dead"];
    enemies.forEach((e) => {
      anims.forEach((a) => {
        const key = a === "dead" ? `${e}_dead` : `${e}_${a}`;
        const file = a === "dead" ? `${e}_death` : `${e}_${a}`;
        this.load.spritesheet(key, `world/DeepDungeonAssets/${file}.png`, { frameWidth: 96, frameHeight: 64 });
      });
    });
    this.load.spritesheet("frankenstein_attackAoE", "world/DeepDungeonAssets/frankenstein2_attack.png", { frameWidth: 96, frameHeight: 64 });
    this.load.spritesheet("devil_attackAoE", "world/DeepDungeonAssets/devil2_attack.png", { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet("devil_attack", "world/DeepDungeonAssets/devil3_attack.png", { frameWidth: 96, frameHeight: 64 });
  }

  async create() {
    this.enemies = [];
    this.traps = [];
    this.crystals = [];
    this.occupiedTiles.clear();
    this.isTransitioning = false;

    // Initialize _stats from registry on first load (trophy-boosted stats injected
    // by React). On level transitions, init() already set _stats from carried data.
    if (!this._stats) {
      const reg = this.registry.get("initialStats") as DeepDungeonPlayerStats | undefined;
      this._stats = {
        energy: reg?.energy ?? 100,
        maxEnergy: reg?.energy ?? 100,
        attack: reg?.attack ?? 1,
        defense: reg?.defense ?? 1,
        criticalChance: reg?.criticalChance ?? 5,
        inventory: { pickaxe: reg?.startingPickaxes ?? 1 },
        currentLevel: this.currentLevel,
      };
    }

    super.create();

    this.groundLayer = this.layers["Ground"];
    this.wallLayer = this.layers["Wall"];

    if (!this.groundLayer) {
      const tileset = this.map.getTileset("Tileset-deep-dungeon");
      this.groundLayer = this.map.createLayer("Ground", tileset!, 0, 0);
      this.wallLayer = this.map.createLayer("Wall", tileset!, 0, 0);
    }

    this.energyOrbsGroup = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite });

    if (this.wallLayer) {
      this.physics.add.collider(this.energyOrbsGroup, this.wallLayer);
    }

    if (this.currentPlayer) {
      this.physics.add.overlap(
        this.currentPlayer,
        this.energyOrbsGroup,
        (_, orb) => this.collectEnergy(orb as Phaser.Physics.Arcade.Sprite),
        undefined,
        this,
      );
    }

    const levelData = LEVEL_MAPS[this.currentLevel];

    this.backgroundMusic = this.sound.add("backgroundMusic", { loop: true, volume: 0.2 });
    this.backgroundMusic.play();

    if (this.currentPlayer) {
      const startX = levelData.playerStart.x + 8;
      const startY = levelData.playerStart.y + 4;
      this.currentPlayer.setPosition(startX, startY);

      this.gridMovement = new GridMovement(
        this,
        this.currentPlayer as BumpkinContainer,
        16,
        this.layers,
        () => this._stats,
      );

      if (this.input.keyboard) {
        this.playerKeys = {
          ATTACK: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
          HURT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
          DEATH: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
          MINE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
          DIG: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
          AXE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
        };
      }

      this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        const swipeThreshold = 50;
        const dragX = pointer.upX - pointer.downX;
        const dragY = pointer.upY - pointer.downY;
        if (Math.max(Math.abs(dragX), Math.abs(dragY)) > swipeThreshold) {
          if (Math.abs(dragX) > Math.abs(dragY)) {
            if (dragX > 0) this.swipeRight = true; else this.swipeLeft = true;
          } else {
            if (dragY > 0) this.swipeDown = true; else this.swipeUp = true;
          }
        }
      });

      this.buildLevel(this.currentLevel);

      this.events.on("PLAYER_MOVED", () => {
        this.enemies.forEach((enemy) => { if (enemy?.active) enemy.updateMovement(); });
      });

      this.createFog();
    }

    this.events.once("shutdown", () => {
      this.events.off("PLAYER_MOVED");
      this.backgroundMusic?.stop();
    });

    // Notify React of initial stats
    this.phaserApi?.onStatsChanged(this._stats);
  }

  // Override to prevent BaseScene from calling idle()/walk() on the player every frame,
  // which would reset isAttacking/isHurting/isMining and break combat animations.
  // DeepDungeon manages all player animations through loadBumpkinAnimations() and GridMovement.
  public updatePlayer(): void {
    // Skip idle()/walk() from BaseScene — DeepDungeon uses grid-based movement.
    // Still update depth so the player renders above/below objects correctly.
    if (this.currentPlayer) {
      this.currentPlayer.setDepth(Math.floor(this.currentPlayer.y));
    }
  }

  update() {
    super.update();

    if (!this.currentPlayer || !this.cursorKeys) return;

    // Safety: unlock GridMovement if no tween is running
    if (this.gridMovement && (this.gridMovement as any).isMoving && !this.tweens.isTweening(this.currentPlayer)) {
      (this.gridMovement as any).isMoving = false;
    }

    if (!this.gridMovement) return;

    if (this._stats?.energy <= 0 && !this.currentPlayer.isDead) {
      this.handlePlayerDeath();
      return;
    }

    const body = this.currentPlayer.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    const isBusy = this.currentPlayer.isAttacking || this.currentPlayer.isHurting || this.currentPlayer.isMining;

    if (!isBusy) {
      this.gridMovement.handleInput({
        ...this.cursorKeys,
        left:  { isDown: this.cursorKeys?.left?.isDown  || this.swipeLeft },
        right: { isDown: this.cursorKeys?.right?.isDown || this.swipeRight },
        up:    { isDown: this.cursorKeys?.up?.isDown    || this.swipeUp },
        down:  { isDown: this.cursorKeys?.down?.isDown  || this.swipeDown },
      } as any);

      this.swipeLeft = this.swipeRight = this.swipeUp = this.swipeDown = false;
      this.handlePlayerActions();
    }

    this.loadBumpkinAnimations();

    if (this.darknessMask && this.visionCircle) {
      const x = Math.round(this.currentPlayer.x);
      const y = Math.round(this.currentPlayer.y);
      if (x !== this._lastFogX || y !== this._lastFogY) {
        this.darknessMask.erase(this.visionCircle, x, y);
        this._lastFogX = x;
        this._lastFogY = y;
      }
    }
  }

  // ── Combat ─────────────────────────────────────────────────────────────────

  public handlePlayerDamage(baseAttack: number, critChanceBase?: number, canCrit = false) {
    if (!this._stats || this.currentPlayer?.isDead) return;

    const isCrit = canCrit && Math.random() < (critChanceBase ?? 0.1);
    const attackAfterCrit = isCrit ? baseAttack * 2 : baseAttack;
    const damageDealt = Math.max(1, Math.round(attackAfterCrit - (this._stats.defense ?? 0)));
    const newEnergy = this._stats.energy - damageDealt;

    if (canCrit && this.currentPlayer) {
      const { x, y } = this.currentPlayer;
      if (isCrit) {
        this.spawnCritText(x, y, true);
        this.time.delayedCall(300, () => this.spawnDamageText(x, y, damageDealt, true));
      } else {
        this.spawnDamageText(x, y, damageDealt, true);
      }
    }

    if (newEnergy <= 0) {
      this.updateStats({ energy: 0 });
      this.handlePlayerDeath();
    } else {
      this.updateStats({ energy: newEnergy });
      if (this.currentPlayer) this.currentPlayer.hurt();
    }
  }

  public handleEnemyDamage(enemy: EnemyContainer) {
    if (!this._stats) return;

    const isCrit = Math.random() < (this._stats.criticalChance / 100);
    const baseAttack = this._stats.attack ?? 1;
    const totalAttack = isCrit ? baseAttack * 2 : baseAttack;
    const damageDealt = Math.max(1, Math.round(totalAttack - (enemy.stats.defense || 0)));

    if (isCrit) {
      this.spawnCritText(enemy.x, enemy.y, false);
      this.time.delayedCall(300, () => this.spawnDamageText(enemy.x, enemy.y, damageDealt, false));
    } else {
      this.spawnDamageText(enemy.x, enemy.y, damageDealt, false);
    }

    enemy.takeDamage(damageDealt, isCrit);
  }

  public handlePlayerDeath() {
    if (this.isTransitioning || !this.currentPlayer || this.currentPlayer.isDead) return;

    this.currentPlayer.isDead = true;
    this.isTransitioning = true;

    this.currentPlayer.dead();
    this.sound.play("dead_bumpkin", { volume: 0.75 });
    this.gridMovement?.setFrozen(true);

    // Notify React after animation plays
    this.time.delayedCall(2000, () => {
      this.phaserApi?.onGameOver();
    });
  }

  public checkTrapsAt(worldX: number, worldY: number) {
    const tx = Math.floor(worldX / 16);
    const ty = Math.floor(worldY / 16);

    if (!this.traps?.length) return;

    const trapAtPos = this.traps.find(
      (t) => Math.floor(t.x / 16) === tx && Math.floor(t.y / 16) === ty,
    );
    if (!trapAtPos) return;

    trapAtPos.activate();
    this.sound.play("spikes_trap", { volume: 0.5 });

    if (this.currentPlayer) {
      const pTx = Math.floor(this.currentPlayer.x / 16);
      const pTy = Math.floor(this.currentPlayer.y / 16);

      if (tx === pTx && ty === pTy) {
        const damage = this.currentLevel <= 5 ? 2 : 5;
        const currentEnergy = this._stats?.energy ?? 0;

        this.spawnDamageText(this.currentPlayer.x, this.currentPlayer.y, damage, true);
        this.updateStats({ energy: Math.max(0, currentEnergy - damage) });

        if (currentEnergy - damage <= 0) {
          this.handlePlayerDeath();
          return;
        }
        this.currentPlayer.hurt();
        return;
      }
    }

    this.enemies
      .filter((e) => Math.floor(e.x / 16) === tx && Math.floor(e.y / 16) === ty)
      .forEach((e) => e.takeDamage(e.trapDamage));
  }

  public handleMining(crystal: CrystalContainer) {
    const pickaxes = this._stats?.inventory.pickaxe ?? 0;
    if (pickaxes <= 0 || crystal.isBeingMined) return;

    crystal.isBeingMined = true;
    this.sound.play("mine_crystal", { volume: 0.5 });

    if (this.currentPlayer) {
      this.currentPlayer.isMining = true;
      this.currentPlayer.mining();
    }

    this.updateStats({ inventory: { ...this._stats.inventory, pickaxe: pickaxes - 1 } });
    this.phaserApi?.onCrystalMined(`${crystal.type}_crystal_${crystal.crystalLevel}`);

    this.time.delayedCall(800, () => {
      if (this.currentPlayer) {
        this.currentPlayer.isMining = false;
        this.currentPlayer.idle();
      }

      crystal.emit("crystal_destroyed", { x: crystal.x, y: crystal.y, type: crystal.type, level: crystal.crystalLevel });

      this.tweens.add({
        targets: crystal,
        scale: 0,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          this.crystals = this.crystals.filter((c) => c !== crystal);
          crystal.destroy();
        },
      });
    });
  }

  // ── Notifications from EnemyContainer ────────────────────────────────────

  public addPickaxe() {
    const current = this._stats?.inventory.pickaxe ?? 0;
    this.updateStats({ inventory: { ...this._stats.inventory, pickaxe: current + 1 } });
  }

  public onEnemyKilled(type: EnemyType) {
    this.phaserApi?.onEnemyKilled(type);
  }

  /**
   * Apply a card bonus chosen by the player in the React card selector.
   * Called by DeepDungeonGamePage after the player picks a card.
   */
  public applyCardBonus(bonus: Card["bonus"]) {
    const newMaxEnergy = this._stats.maxEnergy + (bonus.maxEnergy ?? 0);
    const newEnergy = Math.min(newMaxEnergy, this._stats.energy + (bonus.energy ?? 0) + (bonus.maxEnergy ?? 0));
    const inv = { ...this._stats.inventory };
    if (bonus.pickaxe) inv.pickaxe = (inv.pickaxe ?? 0) + bonus.pickaxe;
    this.updateStats({
      attack: this._stats.attack + (bonus.attack ?? 0),
      defense: this._stats.defense + (bonus.defense ?? 0),
      criticalChance: this._stats.criticalChance + (bonus.criticalChance ?? 0),
      energy: newEnergy,
      maxEnergy: newMaxEnergy,
      inventory: inv,
    });
  }

  /**
   * Apply a loot-drop stat boost by key (ATTACK / DEFENSE / CRIT / PICKAXE).
   * Called by EnemyContainer when the player walks over a drop.
   */
  public applyStatDrop(key: string) {
    const config = DROP_ITEMS_CONFIG[key as keyof typeof DROP_ITEMS_CONFIG];
    if (!config) return;
    // Build a mutable proxy that matches the PlayerStats shape
    const proxy = {
      attack: this._stats.attack,
      defense: this._stats.defense,
      criticalChance: this._stats.criticalChance,
      energy: this._stats.energy,
      maxEnergy: this._stats.maxEnergy,
      inventory: { ...this._stats.inventory },
    };
    config.action(proxy);
    this.updateStats({
      attack: proxy.attack,
      defense: proxy.defense,
      criticalChance: proxy.criticalChance,
      energy: proxy.energy,
      maxEnergy: proxy.maxEnergy,
      inventory: proxy.inventory,
    });
  }

  // ── Level progression ──────────────────────────────────────────────────────

  private handleNextLevel() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const nextLevel = this.currentLevel + 1;
    this.sound.play("next_level", { volume: 0.5 });

    // +15 energy reward for completing a floor, capped at maxEnergy
    this.updateStats({
      energy: Math.min(this._stats.maxEnergy, this._stats.energy + 15),
    });

    this.physics.pause();
    this.events.off("PLAYER_MOVED");

    this.phaserApi?.onNextLevel(nextLevel);
    this.phaserApi?.onOpenCardSelector();

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("deep-dungeon", { level: nextLevel, stats: this._stats });
    });
  }

  // ── Energy orbs ────────────────────────────────────────────────────────────

  private collectEnergy(orb: Phaser.Physics.Arcade.Sprite) {
    const value = orb.getData("value") as number;
    this.sound.play("win_energy", { volume: 0.4 });
    this.updateStats({ energy: Math.min(this._stats.maxEnergy, this._stats.energy + value) });

    const text = this.add.text(orb.x, orb.y - 5, `+${value} Energy`, {
      fontFamily: "monospace", fontSize: "6px", color: "#ffff00",
      stroke: "#000000", strokeThickness: 2, resolution: 10,
    }).setOrigin(0.5).setDepth(3000);

    this.tweens.add({
      targets: text,
      y: text.y - 35,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: "Linear",
      onComplete: () => text.destroy(),
    });

    orb.destroy();
  }

  // ── Spawning ───────────────────────────────────────────────────────────────

  private spawnPickaxes(count: number) {
    const layer = this.map.getLayer("Ground");
    if (!layer?.tilemapLayer) return;
    const validTiles = layer.tilemapLayer.filterTiles((t: Phaser.Tilemaps.Tile) => t.index !== -1);

    let spawned = 0, attempts = 0;
    while (spawned < count && attempts < 100) {
      attempts++;
      const tile = Phaser.Utils.Array.GetRandom(validTiles) as Phaser.Tilemaps.Tile;
      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        new PickaxeContainer({ scene: this, x: tile.getCenterX(), y: tile.getCenterY(), player: this.currentPlayer! });
        this.markTileAsOccupied(tile.pixelX, tile.pixelY);
        spawned++;
      }
    }
  }

  private spawnEnemies(type: EnemyType, count: number) {
    const layer = this.map.getLayer("Ground");
    if (!layer?.tilemapLayer || !this.currentPlayer) return;
    const validTiles = layer.tilemapLayer.filterTiles((t: Phaser.Tilemaps.Tile) => t.index !== -1);
    if (!validTiles.length) return;

    let spawned = 0, attempts = 0;
    while (spawned < count && attempts < count * 10) {
      attempts++;
      const tile = validTiles[Math.floor(Math.random() * validTiles.length)];
      const x = tile.getCenterX(), y = tile.getCenterY();

      if (Phaser.Math.Distance.Between(x, y, this.currentPlayer.x, this.currentPlayer.y) > 120) {
        const enemy = new EnemyContainer({ scene: this, x, y, player: this.currentPlayer, type });
        this.enemies.push(enemy);
        this.crystals.forEach((crystal) => this.physics.add.collider(enemy, crystal));
        spawned++;
      }
    }
  }

  private spawnTraps(quantity: number) {
    this.traps = [];
    const layer = this.map.getLayer("Ground");
    if (!layer?.tilemapLayer) return;
    const validTiles = layer.tilemapLayer.filterTiles((t: Phaser.Tilemaps.Tile) => t.index > 0);

    for (let i = 0; i < quantity; i++) {
      const idx = Phaser.Math.Between(0, validTiles.length - 1);
      const tile = validTiles[idx];
      const x = layer.tilemapLayer.tileToWorldX(tile.x)! + 8;
      const y = layer.tilemapLayer.tileToWorldY(tile.y)! + 8;

      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        this.traps.push(new TrapContainer(this, x, y, this.currentLevel));
        this.markTileAsOccupied(tile.pixelX, tile.pixelY);
      }
      validTiles.splice(idx, 1);
    }
  }

  private spawnStairsRandomly() {
    const validTiles = this.groundLayer.filterTiles((t: Phaser.Tilemaps.Tile) => t.index !== -1);
    if (!validTiles.length) return;

    const tile = Phaser.Utils.Array.GetRandom(validTiles) as Phaser.Tilemaps.Tile;
    const stairs = new StairContainer(this, tile.getCenterX(), tile.getCenterY(), this.currentPlayer!, () => this.handleNextLevel());

    if (stairs.body) {
      (stairs.body as Phaser.Physics.Arcade.Body).setSize(4, 4).setOffset(2, 2);
    }
    this.markTileAsOccupied(tile.pixelX, tile.pixelY);
  }

  private spawnCrystals(type: CrystalType, crystalLevel: number, count: number) {
    if (!this.groundLayer) return;
    const validTiles = this.groundLayer.filterTiles((t: Phaser.Tilemaps.Tile) => t.index !== -1);
    let spawned = 0;

    while (spawned < count && validTiles.length > 0) {
      const tile = Phaser.Utils.Array.GetRandom(validTiles) as Phaser.Tilemaps.Tile;

      if (!this.isTileOccupied(tile.pixelX, tile.pixelY)) {
        const crystal = new CrystalContainer(this, tile.getCenterX(), tile.getCenterY() - 4, type, crystalLevel);

        crystal.on("crystal_destroyed", (data: any) => {
          const dropData = CRYSTAL_DROP_TABLE[`${data.type}_crystal_${data.level}`];
          if (dropData) this.spawnEnergyOrb(data.x, data.y, this.calculateWeight(dropData.energyDrops));
        });

        this.crystals.push(crystal);
        this.physics.add.collider(this.currentPlayer as any, crystal, () => {
          if (this.currentPlayer?.isMining) crystal.takeDamage();
        }, undefined, this);

        this.occupiedTiles.add(`${tile.x},${tile.y}`);
        spawned++;
      }
    }
  }

  private spawnEnergyOrb(x: number, y: number, amount: number) {
    let texture = "lightning";
    if (amount >= 5 && amount < 10) texture = "lightning5";
    if (amount >= 10) texture = "lightning10";

    const orb = this.energyOrbsGroup.create(x, y, texture) as Phaser.Physics.Arcade.Sprite;
    orb.setData("value", amount).setCollideWorldBounds(true).setDepth(100);
  }

  private buildLevel(level: number) {
    this.occupiedTiles.clear();
    this.crystals = [];
    this.enemies = [];
    this.traps = [];

    const config = LEVEL_DESIGNS[level] ?? LEVEL_DESIGNS[1];
    this.spawnStairsRandomly();
    this.spawnPickaxes(config.pickaxes);
    config.enemies.forEach((e) => this.spawnEnemies(e.type, e.count));
    this.spawnTraps(config.traps);
    config.crystals.forEach((c) => this.spawnCrystals(c.type as CrystalType, c.level, c.count));
  }

  // ── Fog ────────────────────────────────────────────────────────────────────

  private createFog() {
    const { widthInPixels: w, heightInPixels: h } = this.map;
    this.darknessMask = this.add.renderTexture(0, 0, w, h).setOrigin(0, 0);

    const darkLevels = [1,2,3,4,5,11,12,13,14,15];
    this.darknessMask.fill(darkLevels.includes(this.currentLevel) ? 0x191a27 : 0x271714, 1);
    this.darknessMask.setDepth(2000).setScrollFactor(1);

    this.visionCircle = this.make.graphics({ x: 0, y: 0 });
    this.visionCircle.fillStyle(0x191a27, 1).fillCircle(0, 0, 60);
  }

  // ── Animations ─────────────────────────────────────────────────────────────

  private loadBumpkinAnimations() {
    if (!this.currentPlayer || this.currentPlayer.isDead) return;
    if (
      this.currentPlayer.isMining || this.currentPlayer.isAttacking ||
      this.currentPlayer.isHurting || this.currentPlayer.isSwimming
    ) return;

    let animation!: AnimationKeys;
    if (
      !this.currentPlayer.isHurting && !this.currentPlayer.isAttacking &&
      !this.currentPlayer.isMining && !this.currentPlayer.isSwimming &&
      !this.currentPlayer.isWalking
    ) {
      animation = "idle";
    }
    (this.currentPlayer as any)?.[animation]?.();
  }

  private handlePlayerActions() {
    if (!this.currentPlayer || !this.playerKeys) return;
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.ATTACK)) this.currentPlayer.attack();
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.MINE)) this.currentPlayer.mining();
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DIG)) this.currentPlayer.dig();
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.HURT)) this.currentPlayer.hurt();
    if (Phaser.Input.Keyboard.JustDown(this.playerKeys.DEATH)) this.handlePlayerDeath();
  }

  // ── Floating text ──────────────────────────────────────────────────────────

  public spawnDamageText(x: number, y: number, damage: number, isEnemy = false) {
    const text = this.add.text(Math.floor(x), Math.floor(y) - 8, `-${damage}`, {
      fontFamily: "monospace", fontSize: isEnemy ? "7px" : "6px",
      color: "#ff6666", stroke: "#000000", strokeThickness: 2, resolution: 10,
    }).setOrigin(0.5).setDepth(9998);

    this.tweens.add({
      targets: text, y: text.y - 18, alpha: { from: 1, to: 0 }, duration: 800, ease: "Quad.easeOut",
      onUpdate: () => { text.x = Math.round(text.x); text.y = Math.round(text.y); },
      onComplete: () => text.destroy(),
    });
  }

  public spawnCritText(x: number, y: number, _isEnemy = false) {
    const text = this.add.text(Math.floor(x), Math.floor(y) - 10, "CRITICAL!", {
      fontFamily: "monospace", fontSize: "8px", color: "#ffe000",
      stroke: "#000000", strokeThickness: 3, resolution: 10,
    }).setOrigin(0.5).setDepth(9999);

    this.tweens.add({
      targets: text, y: text.y - 20,
      scaleX: { from: 1.4, to: 1 }, scaleY: { from: 1.4, to: 1 },
      alpha: { from: 1, to: 0 }, duration: 900, ease: "Quad.easeOut",
      onUpdate: () => { text.x = Math.round(text.x); text.y = Math.round(text.y); },
      onComplete: () => text.destroy(),
    });
  }

  public spawnFloatingText(x: number, y: number, message: string) {
    const text = this.add.text(Math.floor(x), Math.floor(y) - 5, message, {
      fontFamily: "monospace", fontSize: "6px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 2, resolution: 10,
    }).setOrigin(0.5).setDepth(9999);

    this.tweens.add({
      targets: text, y: text.y - 30, alpha: { from: 1, to: 0 }, duration: 1200, ease: "Linear",
      onUpdate: () => { text.y = Math.round(text.y); },
      onComplete: () => text.destroy(),
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private calculateWeight(drops: { amount: number; weight: number }[]): number {
    const total = drops.reduce((acc, d) => acc + d.weight, 0);
    let r = Math.random() * total;
    for (const drop of drops) {
      if (r < drop.weight) return drop.amount;
      r -= drop.weight;
    }
    return drops[0].amount;
  }

  private isTileOccupied(x: number, y: number): boolean {
    return this.occupiedTiles.has(`${Math.floor(x / 16)},${Math.floor(y / 16)}`);
  }

  private markTileAsOccupied(x: number, y: number) {
    this.occupiedTiles.add(`${Math.floor(x / 16)},${Math.floor(y / 16)}`);
  }

  public isNearWater(tileX: number, tileY: number): boolean {
    const waterLayer = this.layers["Water"];
    if (!waterLayer) return false;
    return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
      .some(({ x, y }) => waterLayer.getTileAt(tileX + x, tileY + y) !== null);
  }
}
