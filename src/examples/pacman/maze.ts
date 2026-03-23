import { SQUARE_WIDTH } from "lib/constants";

/** Grid cell size — matches bumpkin hitbox (`SQUARE_WIDTH`). */
export const PACMAN_CELL = SQUARE_WIDTH;

export type ParsedMaze = {
  cols: number;
  rows: number;
  walls: boolean[][];
  /** Dot / power pellet positions (grid coords). */
  pellets: { gx: number; gy: number; power: boolean }[];
  playerStart: { gx: number; gy: number };
  ghostStarts: { gx: number; gy: number }[];
};

/**
 * # wall · . dot · o power pellet · P player · G ghost · space walkable no pellet
 * Every row is exactly 23 characters (23×16px ≈ 368px wide at default cell size).
 */
const RAW: string[] = [
  "#######################",
  "#..........#..........#",
  "#.###.###..#..###.###.#",
  "#o...................o#",
  "#.##.#.#####.#.##.###.#",
  "#....#...#...#....#...#",
  "###.##.#.#.#.#.##.###.#",
  "#......#...#......#...#",
  "#.######.#.#.######.#.#",
  "#.....G..P..G.......#.#",
  "#.####.#.#.#.####.#.#.#",
  "#..................#..#",
  "#o###.###.###.###.o...#",
  "#.....................#",
  "#######################",
];

function normalizeLines(lines: string[]): string[] {
  const w = Math.max(...lines.map((l) => l.length));
  return lines.map((l) => l.padEnd(w, "#"));
}

export function parseMaze(lines: string[] = RAW): ParsedMaze {
  const norm = normalizeLines(lines);
  const rows = norm.length;
  const cols = norm[0]?.length ?? 0;
  const walls: boolean[][] = [];
  const pellets: { gx: number; gy: number; power: boolean }[] = [];
  let playerStart = { gx: 1, gy: 1 };
  const ghostStarts: { gx: number; gy: number }[] = [];

  for (let gy = 0; gy < rows; gy++) {
    walls[gy] = [];
    const row = norm[gy];
    for (let gx = 0; gx < cols; gx++) {
      const c = row[gx] ?? "#";
      if (c === "#") {
        walls[gy][gx] = true;
        continue;
      }
      walls[gy][gx] = false;
      if (c === ".") pellets.push({ gx, gy, power: false });
      else if (c === "o") pellets.push({ gx, gy, power: true });
      else if (c === "P") playerStart = { gx, gy };
      else if (c === "G") ghostStarts.push({ gx, gy });
    }
  }

  return { cols, rows, walls, pellets, playerStart, ghostStarts };
}

export function gridToPixel(
  gx: number,
  gy: number,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } {
  return {
    x: offsetX + gx * PACMAN_CELL + PACMAN_CELL / 2,
    y: offsetY + gy * PACMAN_CELL + PACMAN_CELL / 2,
  };
}
