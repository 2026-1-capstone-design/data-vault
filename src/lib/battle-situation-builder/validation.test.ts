import { describe, expect, it } from "vitest";

import type { SceneJson } from "./model";
import { validateScene } from "./validation";

function createScene(centerX: number, centerY: number): SceneJson {
  return {
    arena: {
      shape: "circle",
      center: { x: centerX, y: centerY },
      radius: 300,
    },
    teams: [
      { id: "ally", label: "아군", color: "#3B82F6", namePrefix: "U" },
      { id: "enemy", label: "적군", color: "#EF4444", namePrefix: "E" },
    ],
    units: [],
  };
}

describe("validateScene", () => {
  it("rejects scene when arena center is not fixed to (0,0)", () => {
    const result = validateScene(createScene(10, 0));

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected validation to fail");
    }
    expect(result.errors).toContain(
      "arena.center must be fixed to { x: 0, y: 0 }.",
    );
  });
});
