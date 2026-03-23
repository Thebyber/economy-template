import Phaser from "phaser";
import {
  PACMAN_CELL,
  parseMaze,
  gridToPixel,
  type ParsedMaze,
} from "examples/pacman/maze";
import {
  $pacmanExampleState,
  patchPacmanExampleState,
} from "examples/pacman/pacmanExampleStore";
import { playSfx } from "lib/audio";
import { PACMAN_RESTART_EVENT } from "examples/pacman/constants";
import { BumpkinContainer } from "game/BumpkinContainer";
import { RESOURCE_CONFIG } from "config/resources.config";
import { ICON_CONFIG } from "config/icons.config";
import {
  PACMAN_GHOST_TOKENS,
  PACMAN_PLAYER_TOKEN,
  PACMAN_VISUAL,
} from "examples/pacman/pacman.config";

const PLAYER_SPEED = 78;
const GHOST_SPEED = 64;
const TURN_SLOP = 3;
const HIT_R = 5;
const GHOST_CATCH_R = 14;
const PELLET_DISPLAY = 9;
const POWER_DISPLAY = 12;
const WALL_DEPTH = 0;
const PELLET_DEPTH = 1;
const GHOST_DEPTH = 2;
const PLAYER_DEPTH = 3;

type Dir = { x: number; y: number };

const DIRS: Dir[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const LOAD_KEYS = {
  wall: "pac_wall_tile",
  pellet: "pac_pellet",
  power: "pac_power",
} as const;

export class PacmanScene extends Phaser.Scene {
  private maze!: ParsedMaze;
  private offsetX = 0;
  private offsetY = 0;
  private player!: BumpkinContainer;
  private playerDir: Dir = { x: 0, y: 0 };
  private wantedDir: Dir = { x: 0, y: 0 };
  private ghosts: {
    bumpkin: BumpkinContainer;
    dir: Dir;
    startGx: number;
    startGy: number;
  }[] = [];
  private pellets: Phaser.GameObjects.Image[] = [];
  private pelletMeta: { power: boolean }[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lives = 3;
  private score = 0;
  private invulnUntil = 0;
  private ended = false;
  private onRestartBound = () => this.scene.restart();

  constructor() {
    super("PacmanScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.image("shadow", `${base}game/shadow.png`);
    this.load.spritesheet("silhouette", `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });

    this.load.image(LOAD_KEYS.wall, RESOURCE_CONFIG[PACMAN_VISUAL.wallResource].url);
    this.load.image(LOAD_KEYS.pellet, ICON_CONFIG[PACMAN_VISUAL.pelletIcon].url);
    this.load.image(LOAD_KEYS.power, RESOURCE_CONFIG[PACMAN_VISUAL.powerResource].url);
  }

  create() {
    this.ended = false;
    this.maze = parseMaze();
    const mw = this.maze.cols * PACMAN_CELL;
    const mh = this.maze.rows * PACMAN_CELL;
    this.offsetX = Math.floor((this.scale.width - mw) / 2);
    this.offsetY = Math.floor((this.scale.height - mh) / 2);

    this.cameras.main.setBackgroundColor(0x0f0f1a);
    this.cameras.main.setRoundPixels(true);

    this.drawWalls();
    this.spawnPellets();
    this.spawnPlayer();
    this.spawnGhosts();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.score = 0;
    this.lives = 3;
    this.invulnUntil = this.time.now + 2000;
    patchPacmanExampleState({
      score: 0,
      lives: this.lives,
      playing: true,
      result: null,
    });

    document.addEventListener(PACMAN_RESTART_EVENT, this.onRestartBound);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener(PACMAN_RESTART_EVENT, this.onRestartBound);
    });
  }

  private disableBumpkinPhysics(b: BumpkinContainer) {
    const body = b.body as Phaser.Physics.Arcade.Body;
    body.setEnable(false);
    body.setCollideWorldBounds(false);
  }

  private drawWalls() {
    for (let gy = 0; gy < this.maze.rows; gy++) {
      for (let gx = 0; gx < this.maze.cols; gx++) {
        if (!this.maze.walls[gy][gx]) continue;
        const cx = this.offsetX + gx * PACMAN_CELL + PACMAN_CELL / 2;
        const cy = this.offsetY + gy * PACMAN_CELL + PACMAN_CELL / 2;
        const img = this.add
          .image(cx, cy, LOAD_KEYS.wall)
          .setOrigin(0.5)
          .setDisplaySize(PACMAN_CELL, PACMAN_CELL);
        img.setDepth(WALL_DEPTH);
      }
    }
  }

  private spawnPellets() {
    const seen = new Set<string>();
    for (const p of this.maze.pellets) {
      const key = `${p.gx},${p.gy}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { x, y } = gridToPixel(
        p.gx,
        p.gy,
        this.offsetX,
        this.offsetY,
      );
      const tex = p.power ? LOAD_KEYS.power : LOAD_KEYS.pellet;
      const size = p.power ? POWER_DISPLAY : PELLET_DISPLAY;
      const img = this.add.image(x, y, tex).setOrigin(0.5).setDisplaySize(size, size);
      img.setDepth(PELLET_DEPTH);
      this.pellets.push(img);
      this.pelletMeta.push({ power: p.power });
    }
  }

  private spawnPlayer() {
    const { gx, gy } = this.maze.playerStart;
    const { x, y } = gridToPixel(gx, gy, this.offsetX, this.offsetY);
    this.player = new BumpkinContainer(this, x, y, {
      tokenParts: PACMAN_PLAYER_TOKEN,
    });
    this.disableBumpkinPhysics(this.player);
    this.player.setDepth(PLAYER_DEPTH);
    this.playerDir = { x: 0, y: 0 };
    this.wantedDir = { x: 0, y: 0 };
  }

  private spawnGhosts() {
    this.maze.ghostStarts.forEach((g0, i) => {
      const { x, y } = gridToPixel(g0.gx, g0.gy, this.offsetX, this.offsetY);
      const token =
        PACMAN_GHOST_TOKENS[i % PACMAN_GHOST_TOKENS.length] ??
        PACMAN_GHOST_TOKENS[0]!;
      const bumpkin = new BumpkinContainer(this, x, y, {
        tokenParts: token,
      });
      this.disableBumpkinPhysics(bumpkin);
      bumpkin.setDepth(GHOST_DEPTH);
      const dir = DIRS[i % DIRS.length]!;
      this.ghosts.push({
        bumpkin,
        dir: { ...dir },
        startGx: g0.gx,
        startGy: g0.gy,
      });
    });
  }

  private wallAtPixel(px: number, py: number): boolean {
    const gx = Math.floor((px - this.offsetX) / PACMAN_CELL);
    const gy = Math.floor((py - this.offsetY) / PACMAN_CELL);
    if (gx < 0 || gy < 0 || gx >= this.maze.cols || gy >= this.maze.rows)
      return true;
    return this.maze.walls[gy][gx];
  }

  private blocked(px: number, py: number, dir: Dir): boolean {
    if (dir.x === 0 && dir.y === 0) return false;
    const nx = px + dir.x * HIT_R;
    const ny = py + dir.y * HIT_R;
    return this.wallAtPixel(nx, ny);
  }

  private nearTileCenter(entity: Phaser.GameObjects.Container): boolean {
    const lx = entity.x - this.offsetX;
    const ly = entity.y - this.offsetY;
    const mx = lx % PACMAN_CELL;
    const my = ly % PACMAN_CELL;
    const h = PACMAN_CELL / 2;
    return Math.abs(mx - h) < TURN_SLOP && Math.abs(my - h) < TURN_SLOP;
  }

  private tryApplyWantedDir() {
    if (this.wantedDir.x === 0 && this.wantedDir.y === 0) return;
    if (!this.nearTileCenter(this.player)) return;
    if (!this.blocked(this.player.x, this.player.y, this.wantedDir)) {
      this.playerDir = { ...this.wantedDir };
    }
  }

  private moveEntity(
    entity: Phaser.GameObjects.Container,
    dir: Dir,
    speed: number,
    delta: number,
  ): Dir {
    const dt = delta / 1000;
    if (dir.x === 0 && dir.y === 0) return dir;
    const step = speed * dt;
    const nx = entity.x + dir.x * step;
    const ny = entity.y + dir.y * step;
    if (!this.blocked(nx, ny, dir)) {
      entity.setPosition(nx, ny);
      return dir;
    }
    if (dir.x !== 0 && !this.blocked(nx, entity.y, { x: dir.x, y: 0 })) {
      entity.setPosition(nx, entity.y);
      return dir;
    }
    if (dir.y !== 0 && !this.blocked(entity.x, ny, { x: 0, y: dir.y })) {
      entity.setPosition(entity.x, ny);
      return dir;
    }
    return { x: 0, y: 0 };
  }

  private pickGhostDir(g: (typeof this.ghosts)[0]): Dir {
    const lx = g.bumpkin.x - this.offsetX;
    const ly = g.bumpkin.y - this.offsetY;
    const h = PACMAN_CELL / 2;
    const atCenter =
      Math.abs((lx % PACMAN_CELL) - h) < TURN_SLOP * 1.2 &&
      Math.abs((ly % PACMAN_CELL) - h) < TURN_SLOP * 1.2;

    const noReverse = g.dir.x !== 0 || g.dir.y !== 0;
    const valid = DIRS.filter((d) => {
      if (noReverse && d.x === -g.dir.x && d.y === -g.dir.y) return false;
      return !this.blocked(g.bumpkin.x, g.bumpkin.y, d);
    });

    if (valid.length === 0) {
      return { x: -g.dir.x, y: -g.dir.y };
    }

    if (atCenter) {
      if (Math.random() < 0.5) {
        let best = valid[0]!;
        let bestD = Infinity;
        for (const d of valid) {
          const tx = g.bumpkin.x + d.x * PACMAN_CELL;
          const ty = g.bumpkin.y + d.y * PACMAN_CELL;
          const dist = Math.hypot(tx - this.player.x, ty - this.player.y);
          if (dist < bestD) {
            bestD = dist;
            best = d;
          }
        }
        return best;
      }
      return valid[Math.floor(Math.random() * valid.length)]!;
    }

    if (!this.blocked(g.bumpkin.x, g.bumpkin.y, g.dir)) return g.dir;
    return valid[Math.floor(Math.random() * valid.length)]!;
  }

  private faceBumpkin(b: BumpkinContainer, dir: Dir) {
    if (dir.x < 0) b.faceLeft();
    else if (dir.x > 0) b.faceRight();
  }

  private collectPellets() {
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      const p = this.pellets[i]!;
      if (!p.active) continue;
      const d = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (d < PACMAN_CELL * 0.45) {
        const pow = this.pelletMeta[i]?.power;
        this.score += pow ? 50 : 10;
        p.destroy();
        this.pellets.splice(i, 1);
        this.pelletMeta.splice(i, 1);
        playSfx("button");
        patchPacmanExampleState({ score: this.score });
        if (this.pellets.length === 0) this.win();
      }
    }
  }

  private win() {
    if (this.ended) return;
    this.ended = true;
    this.playerDir = { x: 0, y: 0 };
    this.player.idle();
    const high = Math.max(this.score, $pacmanExampleState.get().highScore);
    patchPacmanExampleState({
      playing: false,
      highScore: high,
      result: { won: true, score: this.score },
    });
  }

  private loseLife() {
    if (this.ended) return;
    this.lives -= 1;
    patchPacmanExampleState({ lives: this.lives });
    playSfx("button");
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.resetPositions();
    this.invulnUntil = this.time.now + 2200;
  }

  private gameOver() {
    if (this.ended) return;
    this.ended = true;
    this.playerDir = { x: 0, y: 0 };
    this.player.idle();
    const high = Math.max(this.score, $pacmanExampleState.get().highScore);
    patchPacmanExampleState({
      playing: false,
      highScore: high,
      result: { won: false, score: this.score },
    });
  }

  private resetPositions() {
    const { gx, gy } = this.maze.playerStart;
    const p = gridToPixel(gx, gy, this.offsetX, this.offsetY);
    this.player.setPosition(p.x, p.y);
    this.playerDir = { x: 0, y: 0 };
    this.wantedDir = { x: 0, y: 0 };
    this.player.idle();
    for (const g of this.ghosts) {
      const gp = gridToPixel(g.startGx, g.startGy, this.offsetX, this.offsetY);
      g.bumpkin.setPosition(gp.x, gp.y);
      g.dir = { ...DIRS[Math.floor(Math.random() * DIRS.length)]! };
      g.bumpkin.idle();
    }
  }

  private checkGhostHit() {
    if (this.time.now < this.invulnUntil) return;
    for (const g of this.ghosts) {
      const d = Math.hypot(
        g.bumpkin.x - this.player.x,
        g.bumpkin.y - this.player.y,
      );
      if (d < GHOST_CATCH_R) {
        this.loseLife();
        break;
      }
    }
  }

  update(_t: number, delta: number) {
    if (this.ended) return;

    if (this.cursors.left?.isDown) this.wantedDir = { x: -1, y: 0 };
    else if (this.cursors.right?.isDown) this.wantedDir = { x: 1, y: 0 };
    else if (this.cursors.up?.isDown) this.wantedDir = { x: 0, y: -1 };
    else if (this.cursors.down?.isDown) this.wantedDir = { x: 0, y: 1 };

    this.tryApplyWantedDir();
    this.playerDir = this.moveEntity(
      this.player,
      this.playerDir,
      PLAYER_SPEED,
      delta,
    );

    if (this.playerDir.x !== 0 || this.playerDir.y !== 0) {
      this.player.walk();
      this.faceBumpkin(this.player, this.playerDir);
    } else {
      this.player.idle();
    }

    for (const g of this.ghosts) {
      if (g.dir.x === 0 && g.dir.y === 0) {
        g.dir = { ...DIRS[Math.floor(Math.random() * DIRS.length)]! };
      }
      g.dir = this.pickGhostDir(g);
      g.dir = this.moveEntity(g.bumpkin, g.dir, GHOST_SPEED, delta);
      if (g.dir.x !== 0 || g.dir.y !== 0) {
        g.bumpkin.walk();
        this.faceBumpkin(g.bumpkin, g.dir);
      } else {
        g.bumpkin.idle();
      }
    }

    this.collectPellets();
    this.checkGhostHit();

    const blink = this.time.now < this.invulnUntil;
    this.player.setAlpha(
      blink && Math.floor(this.time.now / 120) % 2 ? 0.35 : 1,
    );
  }
}
