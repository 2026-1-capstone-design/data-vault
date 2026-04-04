import type { Scene } from "./types";

export type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      errors: string[];
    };

export function validateScene(scene: Scene): ValidationResult {
  const errors: string[] = [];

  if (scene.arena.center.x !== 0 || scene.arena.center.y !== 0) {
    errors.push("arena.center must be fixed to { x: 0, y: 0 }.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return { ok: true };
}
