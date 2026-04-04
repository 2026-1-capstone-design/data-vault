import type { Arena } from "./types";

type ClampInput = {
  x: number;
  y: number;
  unitRadius: number;
};

export function clampUnitPositionToArena(
  arena: Arena,
  input: ClampInput,
): { x: number; y: number } {
  const dx = input.x - arena.center.x;
  const dy = input.y - arena.center.y;
  const distance = Math.hypot(dx, dy);
  const allowedRadius = Math.max(0, arena.radius - input.unitRadius);

  if (distance <= allowedRadius || distance === 0) {
    return { x: input.x, y: input.y };
  }

  const ratio = allowedRadius / distance;
  return {
    x: arena.center.x + dx * ratio,
    y: arena.center.y + dy * ratio,
  };
}
