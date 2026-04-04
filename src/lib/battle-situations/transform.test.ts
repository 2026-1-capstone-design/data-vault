import { describe, expect, it } from "vitest";

import { toSemantic } from "./transform";
import type { Scene } from "./types";

describe("toSemantic", () => {
  it("maps units into allies and enemies by teamId", () => {
    const scene: Scene = {
      arena: {
        shape: "circle",
        center: { x: 0, y: 0 },
        radius: 300,
      },
      teams: [
        { id: "ally", label: "아군", color: "#3B82F6", namePrefix: "U" },
        { id: "enemy", label: "적군", color: "#EF4444", namePrefix: "E" },
      ],
      units: [
        {
          unitId: "u-1",
          name: "U_01",
          teamId: "ally",
          x: 10,
          y: 20,
          unitRadius: 16,
          hp: 100,
          maxHp: 100,
          atk: 10,
          range: 1.5,
          moveSpeed: 3,
          attackSpeed: 1,
          skillDescription: "",
        },
        {
          unitId: "e-1",
          name: "E_01",
          teamId: "enemy",
          x: -10,
          y: -20,
          unitRadius: 16,
          hp: 90,
          maxHp: 90,
          atk: 11,
          range: 1.2,
          moveSpeed: 2.8,
          attackSpeed: 0.9,
          skillDescription: "돌진",
        },
      ],
    };

    const semantic = toSemantic(scene);

    expect(semantic.arena).toEqual(scene.arena);
    expect(semantic.allies).toEqual([
      {
        unitId: "u-1",
        name: "U_01",
        position: { x: 10, y: 20 },
        stats: { hp: 100, atk: 10, range: 1.5 },
        skillDescription: "",
      },
    ]);
    expect(semantic.enemies).toEqual([
      {
        unitId: "e-1",
        name: "E_01",
        position: { x: -10, y: -20 },
        stats: { hp: 90, atk: 11, range: 1.2 },
        skillDescription: "돌진",
      },
    ]);
  });
});
