import Phaser from "phaser";
import plazaPartyMap from "../assets/plazaPartyMap.json";
import sunnysideTilesetStub from "../assets/sunnysideTilesetStub.json";
import { BumpkinContainer } from "game/BumpkinContainer";
import { WALKING_SPEED } from "lib/constants";
import { MMO_SERVER_REGISTRY_KEY } from "lib/mmo";
import {
  plazaPartyTilesetUrl,
  plazaPartyWildMushroomUrl,
} from "../lib/plazaPartyAssets";
import { getAnimationApiBase } from "lib/portal/url";
import {
  bumpkinTextureKeyForToken,
  getOrCreateOfflinePlazaPartyTokenParts,
  OFFLINE_ICONIC_BUMPKIN_TOKENS,
} from "../lib/plazaPartyOfflineBumpkin";
import { PLAZA_PARTY_MINIGAME_SLUG } from "../lib/plazaPartySlug";
import { addPlazaPartyMushrooms } from "../lib/plazaPartyStore";

const MAP_KEY = "plaza-party-map";
const TILESET_TEXTURE_KEY = "plaza-party-tileset";
const MUSHROOM_KEY = "plaza-party-mushroom";
const SUNNYSIDE_TILESET_NAME = "Sunnyside V3";
const SILHOUETTE_KEY = "silhouette";
const SHADOW_KEY = "shadow";
const REMOTE_PLAYER_TEXTURE = "plaza_party_player";

/** Layer draw order — mirrors Sunflower Land `BaseScene` plaza ordering. */
const TOP_LAYERS = new Set([
  "Decorations Layer 1",
  "Decorations Foreground",
  "Decorations Layer 2",
  "Decorations Layer 3",
  "Decorations Layer 4",
  "Building Layer 2",
  "Building Layer 3",
  "Building Layer 4",
  "Club House Roof",
  "Building Decorations 2",
]);

/** Walkable-ish spots on the plaza (world px) for collectible spawns. */
const MUSHROOM_SPAWNS: { x: number; y: number }[] = [
  { x: 352, y: 240 },
  { x: 448, y: 200 },
  { x: 528, y: 320 },
  { x: 400, y: 350 },
  { x: 640, y: 200 },
  { x: 288, y: 180 },
  { x: 512, y: 260 },
  { x: 704, y: 340 },
  { x: 416, y: 128 },
  { x: 576, y: 400 },
  { x: 240, y: 320 },
  { x: 688, y: 160 },
  { x: 480, y: 288 },
  { x: 320, y: 400 },
  { x: 600, y: 256 },
];

const CAMERA_ZOOM = 2.25;
const SEND_PACKET_RATE = 10;
/** Above plaza “foreground” tile layers (`1_000_000`) so the player is always visible. */
const DEPTH_MUSHROOMS = 1_480_000;
const DEPTH_REMOTE_PLAYERS = 1_520_000;
const DEPTH_LOCAL_PLAYER = 1_550_000;

type MmoRoomHandle = {
  sessionId: string;
  send: (type: number, msg: Record<string, unknown>) => void;
  state: {
    players?: {
      forEach: (
        cb: (
          player: { x: number; y: number; sceneId: string },
          sessionId: string,
        ) => void,
      ) => void;
    };
  };
};

export class PlazaPartyScene extends Phaser.Scene {
  private playerSprite?: Phaser.Physics.Arcade.Sprite;
  private playerBumpkin?: BumpkinContainer;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private mushroomGroup?: Phaser.Physics.Arcade.StaticGroup;
  private mmoRoom?: MmoRoomHandle;
  private packetSentAt = 0;
  private serverPosition = { x: 0, y: 0 };
  private remoteSprites: Record<string, Phaser.GameObjects.Sprite> = {};

  constructor() {
    super("PlazaPartyScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    const tileUrl = plazaPartyTilesetUrl();
    const mushroomUrl = plazaPartyWildMushroomUrl();

    this.load.image(TILESET_TEXTURE_KEY, tileUrl);
    this.load.image(MUSHROOM_KEY, mushroomUrl);

    this.load.image(SHADOW_KEY, `${base}game/shadow.png`);
    this.load.spritesheet(SILHOUETTE_KEY, `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });

    this.load.spritesheet(REMOTE_PLAYER_TEXTURE, `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });

    const tilesetsForLoader = sunnysideTilesetStub.tilesets.map((ts) => ({
      ...ts,
      image: tileUrl,
    }));
    const mapPayload = {
      ...plazaPartyMap,
      tilesets: tilesetsForLoader,
    };
    this.load.tilemapTiledJSON(MAP_KEY, mapPayload as never);

    const animBase = getAnimationApiBase();
    for (const token of OFFLINE_ICONIC_BUMPKIN_TOKENS) {
      const key = bumpkinTextureKeyForToken(token);
      this.load.spritesheet(
        key,
        `${animBase}/animate/0_v1_${token}/idle_walking_dig_drilling`,
        { frameWidth: 96, frameHeight: 64 },
      );
    }
  }

  private getPlayerColliderTarget():
    | Phaser.Physics.Arcade.Sprite
    | BumpkinContainer {
    const p = this.playerBumpkin ?? this.playerSprite;
    if (!p) {
      throw new Error("Plaza Party: no player");
    }
    return p;
  }

  create() {
    this.mmoRoom = this.game.registry.get(
      MMO_SERVER_REGISTRY_KEY,
    ) as MmoRoomHandle | undefined;

    const map = this.make.tilemap({ key: MAP_KEY });
    const tileset = map.addTilesetImage(
      SUNNYSIDE_TILESET_NAME,
      TILESET_TEXTURE_KEY,
      16,
      16,
      1,
      2,
    );
    if (!tileset) {
      throw new Error("Plaza Party: could not load map graphics.");
    }

    map.getTileLayerNames().forEach((name) => {
      const layer = map.createLayer(name, [tileset], 0, 0);
      if (!layer) return;
      if (TOP_LAYERS.has(name)) {
        layer.setDepth(1_000_000);
      }
    });

    const worldW = map.widthInPixels;
    const worldH = map.heightInPixels;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    const collisionObjects = map.createFromObjects("Collision", {
      scene: this,
    });
    collisionObjects.forEach((obj) => {
      (obj as Phaser.GameObjects.GameObject & { setVisible(v: boolean): void }).setVisible(
        false,
      );
      this.physics.world.enable(obj);
      const body = obj.body as Phaser.Physics.Arcade.Body | undefined;
      body?.setImmovable(true);
    });

    const spawnX = worldW * 0.45;
    const spawnY = worldH * 0.55;

    if (this.mmoRoom) {
      this.playerSprite = this.physics.add.sprite(
        spawnX,
        spawnY,
        REMOTE_PLAYER_TEXTURE,
        0,
      );
      this.playerSprite.setDepth(DEPTH_LOCAL_PLAYER);
      this.playerSprite.setCollideWorldBounds(true);
      const pBody = this.playerSprite.body as Phaser.Physics.Arcade.Body;
      pBody.setSize(12, 12);
      pBody.setOffset(1, 6);
      this.serverPosition = { x: spawnX, y: spawnY };
    } else {
      this.playerBumpkin = new BumpkinContainer(this, spawnX, spawnY, {
        tokenParts: getOrCreateOfflinePlazaPartyTokenParts(),
      });
      this.playerBumpkin.setDepth(DEPTH_LOCAL_PLAYER);
    }

    const playerTarget = this.getPlayerColliderTarget();
    collisionObjects.forEach((obj) => {
      this.physics.add.collider(playerTarget, obj);
    });

    this.mushroomGroup = this.physics.add.staticGroup();
    this.spawnMushrooms();

    this.physics.add.overlap(
      playerTarget,
      this.mushroomGroup,
      (_player, mushroom) => {
        const m = mushroom as Phaser.Physics.Arcade.Sprite;
        if (!m.active) return;
        m.destroy();
        addPlazaPartyMushrooms(1);
        const remaining = this.mushroomGroup?.countActive(true) ?? 0;
        if (remaining === 0) {
          this.time.delayedCall(1200, () => this.spawnMushrooms());
        }
      },
    );

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, worldH);
    cam.setZoom(CAMERA_ZOOM);
    cam.setRoundPixels(true);
    // Lerp + roundPixels causes visible shimmer; match main game (no follow lag).
    cam.startFollow(playerTarget, true, 1, 1);

    this.events.on(
      Phaser.Scenes.Events.POST_UPDATE,
      this.snapPlayerToPixels,
      this,
    );

    this.events.once("shutdown", () => {
      this.events.off(
        Phaser.Scenes.Events.POST_UPDATE,
        this.snapPlayerToPixels,
        this,
      );
      Object.values(this.remoteSprites).forEach((s) => s.destroy());
      this.remoteSprites = {};
    });
  }

  private snapPlayerToPixels = () => {
    const p = this.playerBumpkin ?? this.playerSprite;
    if (!p?.body) return;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    if (p.x !== x || p.y !== y) {
      p.setPosition(x, y);
    }
  };

  private spawnMushrooms() {
    if (!this.mushroomGroup) return;
    this.mushroomGroup.clear(true, true);
    for (const p of MUSHROOM_SPAWNS) {
      const m = this.physics.add.staticSprite(p.x, p.y, MUSHROOM_KEY);
      m.setScale(0.85);
      m.setDepth(DEPTH_MUSHROOMS);
      m.refreshBody();
      this.mushroomGroup.add(m);
    }
  }

  update() {
    const left =
      this.cursors?.left.isDown || this.keyA?.isDown === true;
    const right =
      this.cursors?.right.isDown || this.keyD?.isDown === true;
    const up = this.cursors?.up.isDown || this.keyW?.isDown === true;
    const down = this.cursors?.down.isDown || this.keyS?.isDown === true;

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    if (this.playerBumpkin) {
      const b = this.playerBumpkin;
      const body = b.body as Phaser.Physics.Arcade.Body;
      if (vx !== 0 || vy !== 0) {
        if (vx < 0) b.faceLeft();
        if (vx > 0) b.faceRight();
        b.walk();
        body.setVelocity(vx * WALKING_SPEED, vy * WALKING_SPEED);
      } else {
        body.setVelocity(0, 0);
        b.idle();
      }
      b.setDepth(DEPTH_LOCAL_PLAYER);
    } else if (this.playerSprite) {
      const body = this.playerSprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(vx * WALKING_SPEED, vy * WALKING_SPEED);
      this.playerSprite.setDepth(DEPTH_LOCAL_PLAYER);
    } else {
      return;
    }

    this.sendMmoPosition();
    this.syncRemotePlayers();
  }

  private sendMmoPosition() {
    const server = this.mmoRoom;
    const sprite = this.playerSprite;
    if (!server || !sprite) return;

    const now = Date.now();
    const moved =
      this.serverPosition.x !== sprite.x ||
      this.serverPosition.y !== sprite.y;
    if (moved && now - this.packetSentAt > 1000 / SEND_PACKET_RATE) {
      this.serverPosition = { x: sprite.x, y: sprite.y };
      this.packetSentAt = now;
      server.send(0, {
        x: sprite.x,
        y: sprite.y,
        sceneId: PLAZA_PARTY_MINIGAME_SLUG,
      });
    }
  }

  private syncRemotePlayers() {
    const server = this.mmoRoom;
    if (!server) return;

    const players = server.state.players;
    if (!players || typeof players.forEach !== "function") return;

    const selfId = server.sessionId;
    const seen = new Set<string>();

    players.forEach((player, sessionId) => {
      if (sessionId === selfId) return;
      if (String(player.sceneId) !== PLAZA_PARTY_MINIGAME_SLUG) return;

      seen.add(sessionId);
      let spr = this.remoteSprites[sessionId];
      if (!spr || !spr.active) {
        spr = this.add.sprite(player.x, player.y, REMOTE_PLAYER_TEXTURE, 0);
        spr.setTint(0x8899cc);
        this.remoteSprites[sessionId] = spr;
      }
      spr.setPosition(player.x, player.y);
      spr.setDepth(DEPTH_REMOTE_PLAYERS);
    });

    Object.keys(this.remoteSprites).forEach((id) => {
      if (!seen.has(id)) {
        this.remoteSprites[id]?.destroy();
        delete this.remoteSprites[id];
      }
    });
  }
}
