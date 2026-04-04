import { describe, expect, it } from "vitest";

import { toCanvasPoint } from "./canvas-geometry";

describe("toCanvasPoint", () => {
  it("projects arena coordinates to centered canvas coordinates", () => {
    const point = toCanvasPoint(
      { x: 90, y: 0 },
      {
        width: 200,
        height: 200,
        arenaRadius: 100,
      },
    );

    expect(point).toEqual({ x: 190, y: 100 });
  });
});
