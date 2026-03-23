import Phaser from "phaser";
import { BumpkinContainer } from "game/BumpkinContainer";
import { $gameState } from "lib/gameStore";
import { RESOURCE_CONFIG } from "config/resources.config";
import { AUDIO_CONFIG } from "config/audio.config";

export class MainScene extends Phaser.Scene {
  private player?: BumpkinContainer;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private unsubGameState?: () => void;

  constructor() {
    super("MainScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.image("shadow", `${base}game/shadow.png`);
    this.load.spritesheet("silhouette", `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });

    // Demo: bundled asset from `images` repo (same as React `ResourceImage name="wood"`).
    this.load.image("demo_wood", RESOURCE_CONFIG.wood.url);
    if (AUDIO_CONFIG.button.url) {
      this.load.audio("demo_button_sfx", [AUDIO_CONFIG.button.url]);
    }
  }

  create() {
    this.cameras.main.setBackgroundColor(0x3d3d3d);
    this.cameras.main.setRoundPixels(true);

    const cx = Math.round(this.scale.width / 2);
    const cy = Math.round(this.scale.height / 2);
    this.player = new BumpkinContainer(this, cx, cy);
    this.cursors = this.input.keyboard?.createCursorKeys();

    const wood = this.add
      .image(cx + 72, cy - 8, "demo_wood")
      .setOrigin(0.5)
      .setScale(2);
    wood.setDepth(1);

    this.input.keyboard?.on("keydown-SPACE", this.playDemoSfx);

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.snapPlayerToPixels, this);

    this.unsubGameState = $gameState.subscribe(() => {
      // React / API updated store — add Phaser reactions here (difficulty, pause, etc.).
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.snapPlayerToPixels, this);
      this.input.keyboard?.off("keydown-SPACE", this.playDemoSfx);
      this.unsubGameState?.();
      this.unsubGameState = undefined;
    });
  }

  private playDemoSfx = () => {
    if (this.cache.audio.exists("demo_button_sfx")) {
      this.sound.play("demo_button_sfx", {
        volume: AUDIO_CONFIG.button.volume,
      });
    }
  };

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

    const speed = 60;
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
      body.setVelocity(0);
      this.player.idle();
    }
  }
}
