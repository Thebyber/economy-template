import Phaser from "phaser";
import { BumpkinContainer } from "game/BumpkinContainer";
import { KALE_KINGS_ASSETS } from "examples/kale-kings/kaleAssets";
import { playSfx } from "lib/audio";
import {
  $kaleKingsState,
  patchKaleKingsState,
  setAdventureCompleteLoot,
} from "examples/kale-kings/kaleKingsStore";
import { rollLootForZone } from "examples/kale-kings/kaleKingsRules";

const GAME_W = 480;
const GAME_H = 320;
const PICKUP_DIST = 26;
const KALE_SCALE = 1.35;

/** Fixed spawn points (avoid center where the bumpkin starts). */
const KALE_SPOTS: { x: number; y: number }[] = [
  { x: 72, y: 64 },
  { x: 408, y: 58 },
  { x: 400, y: 262 },
  { x: 64, y: 256 },
  { x: 248, y: 96 },
];

export class KaleAdventureScene extends Phaser.Scene {
  private player?: BumpkinContainer;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private kaleSprites: Phaser.GameObjects.Image[] = [];
  private collected = 0;

  constructor() {
    super("KaleAdventureScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.image("shadow", `${base}game/shadow.png`);
    this.load.spritesheet("silhouette", `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });
    this.load.image("kale_pickup", KALE_KINGS_ASSETS.kale);
  }

  create() {
    this.collected = 0;
    this.kaleSprites = [];

    this.cameras.main.setBackgroundColor(0x2d4a3e);
    this.cameras.main.setRoundPixels(true);

    this.physics.world.setBounds(0, 0, GAME_W, GAME_H);

    const cx = Math.round(GAME_W / 2);
    const cy = Math.round(GAME_H / 2);
    this.player = new BumpkinContainer(this, cx, cy);
    this.cursors = this.input.keyboard!.createCursorKeys();

    for (const p of KALE_SPOTS) {
      const img = this.add
        .image(p.x, p.y, "kale_pickup")
        .setOrigin(0.5)
        .setDepth(1)
        .setScale(KALE_SCALE);
      this.kaleSprites.push(img);
    }

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.snapPlayerToPixels, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.snapPlayerToPixels, this);
    });
  }

  private snapPlayerToPixels = () => {
    if (!this.player?.body) return;
    const x = Math.round(this.player.x);
    const y = Math.round(this.player.y);
    if (this.player.x !== x || this.player.y !== y) {
      this.player.setPosition(x, y);
    }
  };

  update() {
    if (!this.player || !this.cursors) return;

    if ($kaleKingsState.get().adventureSuccessPending) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.player.idle();
      return;
    }

    const speed = 62;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown) vx -= 1;
    if (this.cursors.right.isDown) vx += 1;
    if (this.cursors.up.isDown) vy -= 1;
    if (this.cursors.down.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      if (vx !== 0 && vy !== 0) {
        const n = speed / Math.SQRT2;
        body.setVelocity(Math.round(vx * n), Math.round(vy * n));
      } else {
        body.setVelocity(vx * speed, vy * speed);
      }
      if (vx < 0) this.player.faceLeft();
      if (vx > 0) this.player.faceRight();
      this.player.walk();
    } else {
      body.setVelocity(0, 0);
      this.player.idle();
    }

    this.tryCollectKale();
  }

  private tryCollectKale() {
    if (!this.player) return;

    for (let i = this.kaleSprites.length - 1; i >= 0; i--) {
      const k = this.kaleSprites[i]!;
      if (!k.active) continue;
      const d = Math.hypot(k.x - this.player.x, k.y - this.player.y);
      if (d < PICKUP_DIST) {
        k.destroy();
        this.kaleSprites.splice(i, 1);
        this.collected += 1;
        patchKaleKingsState({ adventureKaleFound: this.collected });
        playSfx("button");
        if (this.collected >= 5) {
          const zone = $kaleKingsState.get().activeRunZone ?? "meadow";
          setAdventureCompleteLoot(rollLootForZone(zone));
        }
        break;
      }
    }
  }
}
