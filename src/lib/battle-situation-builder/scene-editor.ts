import { clampUnitPositionToArena } from "./arena";
import type { SceneJson, Unit } from "./model";

type EditableUnitFields = Pick<
  Unit,
  | "hp"
  | "maxHp"
  | "atk"
  | "range"
  | "moveSpeed"
  | "attackSpeed"
  | "skillDescription"
  | "unitRadius"
>;

const DEFAULT_UNIT_VALUES: EditableUnitFields = {
  hp: 100,
  maxHp: 100,
  atk: 10,
  range: 1.5,
  moveSpeed: 3,
  attackSpeed: 1,
  unitRadius: 16,
  skillDescription: "",
};

export function addUnit(
  scene: SceneJson,
  teamId: string,
): { scene: SceneJson; unitId: string } {
  const team = scene.teams.find((item) => item.id === teamId);

  if (!team) {
    return { scene, unitId: "" };
  }

  const nextNumber = getNextTeamUnitNumber(scene, team.namePrefix);
  const unitId = crypto.randomUUID();
  const name = `${team.namePrefix}_${String(nextNumber).padStart(2, "0")}`;

  const unit: Unit = {
    unitId,
    name,
    teamId,
    x: 0,
    y: 0,
    ...DEFAULT_UNIT_VALUES,
  };

  return {
    unitId,
    scene: {
      ...scene,
      units: [...scene.units, unit],
    },
  };
}

export function deleteUnit(scene: SceneJson, unitId: string): SceneJson {
  return {
    ...scene,
    units: scene.units.filter((unit) => unit.unitId !== unitId),
  };
}

export function updateUnit(
  scene: SceneJson,
  unitId: string,
  patch: Partial<EditableUnitFields>,
): SceneJson {
  return {
    ...scene,
    units: scene.units.map((unit) =>
      unit.unitId === unitId
        ? {
            ...unit,
            ...patch,
          }
        : unit,
    ),
  };
}

export function moveUnit(
  scene: SceneJson,
  unitId: string,
  position: {
    x: number;
    y: number;
  },
): SceneJson {
  return {
    ...scene,
    units: scene.units.map((unit) => {
      if (unit.unitId !== unitId) {
        return unit;
      }

      const clamped = clampUnitPositionToArena(scene.arena, {
        x: position.x,
        y: position.y,
        unitRadius: unit.unitRadius,
      });
      const quantized = quantizePositionToIntegerInArena(scene.arena, {
        x: clamped.x,
        y: clamped.y,
        unitRadius: unit.unitRadius,
      });

      return {
        ...unit,
        x: quantized.x,
        y: quantized.y,
      };
    }),
  };
}

function quantizePositionToIntegerInArena(
  arena: SceneJson["arena"],
  input: {
    x: number;
    y: number;
    unitRadius: number;
  },
): { x: number; y: number } {
  const allowedRadius = Math.max(0, arena.radius - input.unitRadius);
  const floorX = Math.floor(input.x);
  const ceilX = Math.ceil(input.x);
  const floorY = Math.floor(input.y);
  const ceilY = Math.ceil(input.y);
  const candidates = [
    { x: floorX, y: floorY },
    { x: floorX, y: ceilY },
    { x: ceilX, y: floorY },
    { x: ceilX, y: ceilY },
  ];
  const uniqueCandidates = Array.from(
    new Map(
      candidates.map((candidate) => [
        `${candidate.x}:${candidate.y}`,
        candidate,
      ]),
    ).values(),
  );

  const inBounds = uniqueCandidates.filter((candidate) => {
    const dx = candidate.x - arena.center.x;
    const dy = candidate.y - arena.center.y;
    return Math.hypot(dx, dy) <= allowedRadius;
  });

  if (inBounds.length > 0) {
    return inBounds.reduce((closest, candidate) => {
      const candidateDistance = Math.hypot(
        candidate.x - input.x,
        candidate.y - input.y,
      );
      const closestDistance = Math.hypot(
        closest.x - input.x,
        closest.y - input.y,
      );
      return candidateDistance < closestDistance ? candidate : closest;
    });
  }

  const fallback = {
    x: Math.round(input.x),
    y: Math.round(input.y),
  };

  return clampUnitPositionToArena(arena, {
    x: fallback.x,
    y: fallback.y,
    unitRadius: input.unitRadius,
  });
}

function getNextTeamUnitNumber(scene: SceneJson, namePrefix: string): number {
  const max = scene.units
    .filter((unit) => unit.name.startsWith(`${namePrefix}_`))
    .map((unit) => Number.parseInt(unit.name.slice(namePrefix.length + 1), 10))
    .filter((value) => Number.isFinite(value))
    .reduce((acc, value) => Math.max(acc, value), 0);

  return max + 1;
}
