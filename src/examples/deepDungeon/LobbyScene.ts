import Phaser from "phaser";
import { BumpkinContainer } from "./world/containers/BumpkinContainer";
import { tokenUriBuilder } from "lib/utils/tokenUriBuilder";
import { getAnimationUrl } from "./world/lib/animations";
import { MMO_SERVER_REGISTRY_KEY } from "lib/mmo/registryKey";
import type { Player, PlazaRoomState } from "./world/types/Room";
import { FACTION_NAME_COLORS } from "./world/scenes/BaseScene";
import { BLACKSMITH_NPC_WEARABLES } from "./DeepDungeonConstants";

export const LOBBY_SCENE_SLUG = "deep-dungeon-lobby";

const TILE_SIZE = 16;
const SEND_RATE = 100;

// Spawn near center of the room
const SPAWN_TILE_X = 14;
const SPAWN_TILE_Y = 12;

interface MmoRoom {
  sessionId: string;
  send: (type: number, msg: Record<string, unknown>) => void;
  state: PlazaRoomState;
}

type RemoteEntry = { bumpkin: BumpkinContainer; lastX: number; lastY: number };

export class LobbyScene extends Phaser.Scene {
  private wallLayer?: Phaser.Tilemaps.TilemapLayer;
  private waterLayer?: Phaser.Tilemaps.TilemapLayer;
  private stairsLayer?: Phaser.Tilemaps.TilemapLayer;
  private mapW = 0;
  private mapH = 0;
  private player?: BumpkinContainer;
  private isMoving = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private extraKeys?: Record<string, Phaser.Input.Keyboard.Key>;
  private wasKeyDown = false;
  private swipeLeft = false;
  private swipeRight = false;
  private swipeUp = false;
  private swipeDown = false;
  private lastSentAt = 0;
  private remoteEntries = new Map<string, RemoteEntry>();
  private doorTriggered = false;
  private blacksmithNpc?: BumpkinContainer;
  private blacksmithX = 0;
  private blacksmithY = 0;
  private static readonly BLACKSMITH_PROXIMITY = 40;

  constructor() {
    super({ key: "lobby" });
  }

  preload() {
    // BumpkinContainer common assets
    if (!this.textures.exists("shadow"))
      this.load.image("shadow", "world/shadow.png");
    if (!this.textures.exists("silhouette"))
      this.load.spritesheet("silhouette", "world/silhouette.webp", { frameWidth: 14, frameHeight: 18 });
    if (!this.textures.exists("speech_bubble"))
      this.load.image("speech_bubble", "world/speech_bubble.png");
    if (!this.textures.exists("label"))
      this.load.image("label", "world/label.png");
    if (!this.textures.exists("notice_board"))
      this.load.image("notice_board", "world/notice_board.png");

    // Audio
    if (!this.cache.audio.has("lobby_music"))
      this.load.audio("lobby_music", "world/DeepDungeonAssets/lobby.mp3");
    if (!this.cache.audio.has("swimming"))
      this.load.audio("swimming", "world/DeepDungeonAssets/swimming.mp3");
    if (!this.cache.audio.has("sword_attack"))
      this.load.audio("sword_attack", "world/DeepDungeonAssets/sword_attack.mp3");

    // Bitmap font for NPC labels
    if (!this.cache.bitmapFont.has("Teeny Tiny Pixls"))
      this.load.bitmapFont("Teeny Tiny Pixls", "world/TeenyTinyPixls5.png", "world/TeenyTinyPixls5.xml");

    // Tilemap + tileset
    this.load.tilemapTiledJSON("lobby-map", "world/DeepDungeonAssets/lobby.json");
    if (!this.textures.exists("Tileset-deep-dungeon"))
      this.load.image("Tileset-deep-dungeon", "world/DeepDungeonAssets/Tileset-deep-dungeon.png");

    // Local bumpkin spritesheet (idle + walking)
    const clothing = (this.registry.get("gameState") as any)?.bumpkin?.equipped;
    if (clothing) {
      const key = tokenUriBuilder(clothing);
      if (!this.textures.exists(key)) {
        this.load.spritesheet(key, getAnimationUrl(clothing, ["idle", "walking"]), {
          frameWidth: 96,
          frameHeight: 64,
        });
      }
    }

    // Blacksmith NPC spritesheet
    const npcKey = tokenUriBuilder(BLACKSMITH_NPC_WEARABLES as any);
    if (!this.textures.exists(npcKey)) {
      this.load.spritesheet(npcKey, getAnimationUrl(BLACKSMITH_NPC_WEARABLES as any, ["idle"]), {
        frameWidth: 96,
        frameHeight: 64,
      });
    }
  }

  create() {
    const map = this.make.tilemap({ key: "lobby-map" });
    const tileset = map.addTilesetImage("Sunnyside V3", "Tileset-deep-dungeon", 16, 16, 0, 0)!;

    map.createLayer("Ground", [tileset], 0, 0);
    this.waterLayer = map.createLayer("Water", [tileset], 0, 0) ?? undefined;
    this.wallLayer = map.createLayer("Wall", [tileset], 0, 0) ?? undefined;
    map.createLayer("Path", [tileset], 0, 0);
    map.createLayer("Decorations Base", [tileset], 0, 0);
    this.stairsLayer = map.createLayer("Stairs", [tileset], 0, 0) ?? undefined;

    this.mapW = map.widthInPixels;
    this.mapH = map.heightInPixels;

    // Local player
    const spawnX = SPAWN_TILE_X * TILE_SIZE + 8;
    const spawnY = SPAWN_TILE_Y * TILE_SIZE + 4;
    const localUsername = this.registry.get("username") as string | undefined;
    const localFaction = this.registry.get("faction") as string | undefined;
    this.player = new BumpkinContainer({
      scene: this,
      x: spawnX,
      y: spawnY,
      clothing: this.getLocalClothing(),
    });
    if (localUsername) this.attachUsernameLabel(this.player, localUsername, localFaction);
    this.player.setDepth(600);
    this.add.existing(this.player);

    // Keyboard input
    this.cursors = this.input.keyboard?.createCursorKeys();
    if (this.input.keyboard) {
      this.extraKeys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Swipe input (mobile)
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      const dx = p.upX - p.downX;
      const dy = p.upY - p.downY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) this.swipeRight = true; else this.swipeLeft = true;
        } else {
          if (dy > 0) this.swipeDown = true; else this.swipeUp = true;
        }
      }
    });

    // Background music
    this.sound.play("lobby_music", { loop: true, volume: 0.4 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.sound.stopByKey("lobby_music"));

    // Blacksmith NPC
    const blacksmithLayer = map.getObjectLayer("Blacksmith");
    const blacksmithObj = blacksmithLayer?.objects?.[0];
    if (blacksmithObj) {
      this.blacksmithX = (blacksmithObj.x ?? 0) + 8;
      this.blacksmithY = (blacksmithObj.y ?? 0) + 4;
      const npcClothing = { ...BLACKSMITH_NPC_WEARABLES, updatedAt: 0 } as import("./world/types/Room").Player["clothing"];
      this.blacksmithNpc = new BumpkinContainer({
        scene: this,
        x: this.blacksmithX,
        y: this.blacksmithY,
        clothing: npcClothing,
        name: "Blacksmith",
      });
      this.blacksmithNpc.setDepth(550);
      this.blacksmithNpc.idle();
      this.blacksmithNpc.setInteractive({ useHandCursor: true });
      this.blacksmithNpc.on("pointerdown", () => {
        if (!this.player) return;
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.blacksmithX, this.blacksmithY,
        );
        if (dist <= LobbyScene.BLACKSMITH_PROXIMITY) {
          (this.registry.get("onOpenBlacksmith") as (() => void) | undefined)?.();
        }
      });
      this.add.existing(this.blacksmithNpc);
    }

    // Camera follow
    const zoom = Math.max(
      this.cameras.main.width / this.mapW,
      this.cameras.main.height / this.mapH,
    );
    this.cameras.main
      .setZoom(zoom)
      .startFollow(this.player, true, 0.15, 0.15)
      .setBounds(0, 0, this.mapW, this.mapH);
  }

  update() {
    if (!this.player || this.isMoving) {
      this.wasKeyDown = false;
      return;
    }

    const left  = this.cursors?.left?.isDown  || this.extraKeys?.a?.isDown || this.swipeLeft;
    const right = this.cursors?.right?.isDown || this.extraKeys?.d?.isDown || this.swipeRight;
    const up    = this.cursors?.up?.isDown    || this.extraKeys?.w?.isDown || this.swipeUp;
    const down  = this.cursors?.down?.isDown  || this.extraKeys?.s?.isDown || this.swipeDown;
    const anyDown = left || right || up || down;

    this.swipeLeft = this.swipeRight = this.swipeUp = this.swipeDown = false;

    if (anyDown && !this.wasKeyDown) {
      let dx = 0, dy = 0;
      if (left)       dx = -TILE_SIZE;
      else if (right) dx =  TILE_SIZE;
      else if (up)    dy = -TILE_SIZE;
      else if (down)  dy =  TILE_SIZE;
      if (dx !== 0 || dy !== 0) this.tryMove(dx, dy);
    }
    this.wasKeyDown = !!anyDown;

    this.sendPosition();
    this.syncRemotePlayers();
  }

  private tryMove(dx: number, dy: number) {
    if (this.isMoving || !this.player) return;

    const curX = Math.floor(this.player.x / TILE_SIZE) * TILE_SIZE;
    const curY = Math.floor(this.player.y / TILE_SIZE) * TILE_SIZE;
    const nextX = curX + dx;
    const nextY = curY + dy;

    if (nextX < 0 || nextY < 0 || nextX >= this.mapW || nextY >= this.mapH) return;

    if (this.wallLayer?.getTileAtWorldXY(nextX + 8, nextY + 8) !== null) return;

    // Stairs tile → start the dungeon
    if (
      !this.doorTriggered &&
      this.stairsLayer?.getTileAtWorldXY(nextX + 8, nextY + 8) !== null
    ) {
      this.doorTriggered = true;
      (this.registry.get("onEnterDoor") as (() => void) | undefined)?.();
      return;
    }

    if (dx < 0) this.player.faceLeft();
    else if (dx > 0) this.player.faceRight();

    const isWater = this.waterLayer?.getTileAtWorldXY(nextX + 8, nextY + 8) !== null;
    if (isWater) {
      this.player.isSwimming = true;
      this.player.swimming();
    } else {
      this.player.isSwimming = false;
      this.player.walk();
    }

    this.isMoving = true;
    this.tweens.add({
      targets: this.player,
      x: nextX + 8,
      y: nextY + 4,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        if (!this.player?.isSwimming) this.player?.idle();
      },
    });
  }

  private sendPosition() {
    const room = this.registry.get(MMO_SERVER_REGISTRY_KEY) as MmoRoom | undefined;
    if (!room || !this.player) return;
    const now = Date.now();
    if (now - this.lastSentAt < SEND_RATE) return;
    this.lastSentAt = now;
    try {
      room.send(0, { x: Math.round(this.player.x), y: Math.round(this.player.y) });
    } catch {
      // Room connection closed, ignore
    }
  }

  private syncRemotePlayers() {
    const room = this.registry.get(MMO_SERVER_REGISTRY_KEY) as MmoRoom | undefined;
    if (!room?.state?.players) return;

    const seen = new Set<string>();

    room.state.players.forEach((player: Player, sessionId: string) => {
      if (sessionId === room.sessionId) return;
      if (String(player.sceneId) !== LOBBY_SCENE_SLUG) return;

      seen.add(sessionId);
      const entry = this.remoteEntries.get(sessionId);

      if (!entry) {
        const bumpkin = new BumpkinContainer({
          scene: this,
          x: player.x,
          y: player.y,
          clothing: player.clothing,
        });
        if (player.username) this.attachUsernameLabel(bumpkin, player.username, player.faction);
        bumpkin.setDepth(500);
        this.add.existing(bumpkin);
        this.remoteEntries.set(sessionId, { bumpkin, lastX: player.x, lastY: player.y });
      } else {
        const moved = Math.abs(player.x - entry.lastX) > 1 || Math.abs(player.y - entry.lastY) > 1;
        if (moved) {
          player.x > entry.bumpkin.x ? entry.bumpkin.faceRight() : entry.bumpkin.faceLeft();
          entry.bumpkin.walk();
        } else {
          entry.bumpkin.idle();
        }
        entry.bumpkin.setPosition(
          Phaser.Math.Linear(entry.bumpkin.x, player.x, 0.15),
          Phaser.Math.Linear(entry.bumpkin.y, player.y, 0.15),
        );
        entry.lastX = player.x;
        entry.lastY = player.y;
      }
    });

    for (const [id, entry] of this.remoteEntries) {
      if (!seen.has(id)) {
        entry.bumpkin.destroy();
        this.remoteEntries.delete(id);
      }
    }
  }

  public triggerAttack() {
    if (!this.player || this.player.isDead) return;
    this.player.attack();
  }

  private attachUsernameLabel(container: BumpkinContainer, username: string, faction?: string) {
    const color = faction
      ? (FACTION_NAME_COLORS[faction as keyof typeof FACTION_NAME_COLORS] ?? "#ffffff")
      : "#ffffff";
    const text = this.add.text(0, 14, username, {
      fontSize: "5px",
      color,
      resolution: 4,
    }).setOrigin(0.5, 0);
    container.add(text);
  }

  private getLocalClothing(): Player["clothing"] {
    const equipped = (this.registry.get("gameState") as any)?.bumpkin?.equipped ?? {};
    return { ...equipped, updatedAt: 0 } as Player["clothing"];
  }
}
