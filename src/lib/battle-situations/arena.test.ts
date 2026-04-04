import { describe, expect, it } from "vitest";

import { clampUnitPositionToArena } from "./arena";
import type { Arena } from "./types";

describe("clampUnitPositionToArena", () => {
  it("clamps position to circle boundary considering unit radius", () => {
    const arena: Arena = {
      shape: "circle",
      center: { x: 0, y: 0 },
      radius: 100,
    };

    const position = clampUnitPositionToArena(arena, {
      x: 100,
      y: 0,
      unitRadius: 10,
    });

    expect(position).toEqual({ x: 90, y: 0 });
  });
});
