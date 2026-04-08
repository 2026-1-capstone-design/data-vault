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

type SemanticLike = {
  arena: { shape: "circle"; center: { x: number; y: number }; radius: number };
  allies: Array<{
    unitId: string;
    position: { x: number; y: number };
    stats: { hp: number; atk: number; range: number };
    skillDescription?: string;
  }>;
  enemies: Array<{
    unitId: string;
    position: { x: number; y: number };
    stats: { hp: number; atk: number; range: number };
    skillDescription?: string;
  }>;
};

export function fromSemanticToScene(semantic: SemanticLike): Scene {
  const teams = [
    { id: "ally", label: "아군", color: "#3B82F6", namePrefix: "A" },
    { id: "enemy", label: "적군", color: "#EF4444", namePrefix: "E" },
  ];

  const toUnit = (u: SemanticLike["allies"][number], teamId: string): Unit => ({
    unitId: u.unitId,
    name: u.unitId,
    teamId,
    x: u.position.x,
    y: u.position.y,
    unitRadius: 16,
    hp: u.stats.hp,
    maxHp: u.stats.hp,
    atk: u.stats.atk,
    range: u.stats.range,
    moveSpeed: 3,
    attackSpeed: 1,
    skillDescription: u.skillDescription,
  });

  return {
    arena: semantic.arena,
    teams,
    units: [
      ...semantic.allies.map((u) => toUnit(u, "ally")),
      ...semantic.enemies.map((u) => toUnit(u, "enemy")),
    ],
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
