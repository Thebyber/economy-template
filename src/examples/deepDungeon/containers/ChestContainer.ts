import { DeepDungeonScene } from "../DeepDungeonScene";

const CHEST_DROPS: { label: string; statKey: string; amount: number; weight: number }[] = [
  { label: "+1 Attack",    statKey: "attack",         amount: 1, weight: 25 },
  { label: "+1 Defense",   statKey: "defense",        amount: 1, weight: 25 },
  { label: "+2% Critical Chance", statKey: "criticalChance", amount: 2, weight: 25 },
  { label: "+2 Attack",    statKey: "attack",         amount: 2, weight:  7 },
  { label: "+2 Defense",   statKey: "defense",        amount: 2, weight:  7 },
  { label: "+5% Critical Chance", statKey: "criticalChance", amount: 5, weight:  7 },
  { label: "+1 Deep Coin", statKey: "deep_coin",      amount: 1, weight:  4 },
];

function rollDrop() {
  const total = CHEST_DROPS.reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const drop of CHEST_DROPS) {
    r -= drop.weight;
    if (r <= 0) return drop;
  }
  return CHEST_DROPS[0];
}

export class ChestContainer extends Phaser.GameObjects.Container {
  declare public body: Phaser.Physics.Arcade.Body;
  public scene: DeepDungeonScene;
  private sprite: Phaser.GameObjects.Sprite;
  public isOpened = false;
  private needKeyThrottle = false;

  constructor(scene: DeepDungeonScene, x: number, y: number) {
    super(scene, x, y);
    this.scene = scene;

    this.sprite = scene.add.sprite(0, 0, "chest").setOrigin(0.5);
    this.sprite.setDisplaySize(14, 14);
    this.add(this.sprite);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(12, 10).setOffset(-6, -5).setImmovable(true);
    this.setDepth(25);
  }

  public tryOpen() {
    if (this.isOpened) return;

    const stats = this.scene.getStats();
    const keys = stats?.inventory.key_chest ?? 0;

    if (keys <= 0) {
      if (!this.needKeyThrottle) {
        this.needKeyThrottle = true;
        this.scene.spawnFloatingText(this.x, this.y, "Need key!");
        this.scene.time.delayedCall(2000, () => { this.needKeyThrottle = false; });
      }
      return;
    }

    this.isOpened = true;

    // Consume key & apply drop
    this.scene.applyChestDrop("key_chest", -1);
    const drop = rollDrop();
    this.scene.applyChestDrop(drop.statKey, drop.amount);
    this.scene.applyChestDrop("potion", 1);
    this.scene.spawnFloatingText(this.x, this.y, drop.label);
    this.scene.time.delayedCall(350, () => {
      this.scene.spawnFloatingText(this.x, this.y, "+1 Potion");
    });

    try { this.scene.sound.play("win_item", { volume: 0.5 }); } catch (_) {}

    // Switch to open sprite and disable physics so player/enemies can walk through
    this.sprite.setTexture("chest_open");
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setY(-3);
  }
}
