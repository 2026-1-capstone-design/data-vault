import type { SceneJson } from "./model";

export type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      errors: string[];
    };

export function validateScene(scene: SceneJson): ValidationResult {
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
