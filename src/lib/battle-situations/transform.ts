import type { Scene, Semantic, Unit } from "./types";

function toSemanticUnit(unit: Unit) {
  return {
    unitId: unit.unitId,
    name: unit.name,
    position: {
      x: unit.x,
      y: unit.y,
    },
    stats: {
      hp: unit.hp,
      atk: unit.atk,
      range: unit.range,
    },
    skillDescription: unit.skillDescription ?? "",
  };
}

export function toSemantic(scene: Scene): Semantic {
  const allies = scene.units
    .filter((unit) => unit.teamId === "ally")
    .map(toSemanticUnit);

  const enemies = scene.units
    .filter((unit) => unit.teamId === "enemy")
    .map(toSemanticUnit);

  return {
    arena: scene.arena,
    allies,
    enemies,
  };
}
