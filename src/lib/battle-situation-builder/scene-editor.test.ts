import { describe, expect, it } from "vitest";

import type { SceneJson } from "./model";
import { addUnit, deleteUnit, moveUnit, updateUnit } from "./scene-editor";

const baseScene: SceneJson = {
  arena: {
    shape: "circle",
    center: { x: 0, y: 0 },
    radius: 100,
  },
  teams: [
    { id: "ally", label: "아군", color: "#3B82F6", namePrefix: "U" },
    { id: "enemy", label: "적군", color: "#EF4444", namePrefix: "E" },
  ],
  units: [],
};

describe("scene-editor", () => {
  it("adds unit with fixed team prefix name", () => {
    const { scene, unitId } = addUnit(baseScene, "ally");

    expect(unitId).toBeTypeOf("string");
    expect(scene.units).toHaveLength(1);
    expect(scene.units[0]?.name).toBe("U_01");
    expect(scene.units[0]?.teamId).toBe("ally");
    expect(scene.units[0]).toMatchObject({
      hp: 100,
      maxHp: 100,
      atk: 10,
      range: 1.5,
      moveSpeed: 3,
      attackSpeed: 1,
    });
  });

  it("deletes a unit by id", () => {
    const added = addUnit(baseScene, "enemy");

    const scene = deleteUnit(added.scene, added.unitId);

    expect(scene.units).toHaveLength(0);
  });

  it("updates editable unit fields", () => {
    const added = addUnit(baseScene, "ally");
    const scene = updateUnit(added.scene, added.unitId, {
      hp: 150,
      maxHp: 180,
      atk: 20,
      range: 2.5,
      moveSpeed: 3.4,
      attackSpeed: 1.2,
      skillDescription: "방패 돌진",
    });

    expect(scene.units[0]).toMatchObject({
      hp: 150,
      maxHp: 180,
      atk: 20,
      range: 2.5,
      moveSpeed: 3.4,
      attackSpeed: 1.2,
      skillDescription: "방패 돌진",
      name: "U_01",
    });
  });

  it("moves unit and clamps when position goes out of arena", () => {
    const added = addUnit(baseScene, "ally");

    const scene = moveUnit(added.scene, added.unitId, {
      x: 200,
      y: 0,
    });

    expect(scene.units[0]?.x).toBe(84);
    expect(scene.units[0]?.y).toBe(0);
  });
});
