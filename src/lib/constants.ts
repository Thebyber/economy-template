/** Visual scale used by pixel UI borders (matches Sunflower Land). */
export const PIXEL_SCALE = 2.625;

/** Bumpkin hitbox / tile size in raw pixels. */
export const SQUARE_WIDTH = 16;

/** Land tile width in CSS px (matches Sunflower Land grid). */
export const GRID_WIDTH_PX = PIXEL_SCALE * SQUARE_WIDTH;

/**
 * World movement speed — same value as Sunflower Land `BaseScene` (`WALKING_SPEED`).
 * Use with direction unit vectors so diagonals stay magnitude 50.
 */
export const WALKING_SPEED = 50;
