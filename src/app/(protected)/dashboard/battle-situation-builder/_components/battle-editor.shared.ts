import type {
  SceneJson,
  Team,
  Unit,
} from "~/lib/battle-situation-builder/model";

export type EditableNumericField =
  | "hp"
  | "maxHp"
  | "atk"
  | "range"
  | "moveSpeed"
  | "attackSpeed"
  | "unitRadius";

export type PositionAxis = "x" | "y";

export const FIELD_MINIMUM: Record<EditableNumericField, number> = {
  hp: 1,
  maxHp: 1,
  atk: 0,
  range: 0,
  moveSpeed: 0,
  attackSpeed: 0,
  unitRadius: 1,
};

export const ARENA_RADIUS_MIN = 120;
export const ARENA_RADIUS_MAX = 600;
export const ARENA_RADIUS_STEP = 10;

const createDefaultScene = (): SceneJson => {
  return {
    arena: {
      shape: "circle",
      center: {
        x: 0,
        y: 0,
      },
      radius: 300,
    },
    teams: [
      { id: "ally", label: "아군", color: "#3B82F6", namePrefix: "U" },
      { id: "enemy", label: "적군", color: "#EF4444", namePrefix: "E" },
    ],
    units: [
      {
        unitId: "ally-01",
        name: "U_01",
        teamId: "ally",
        x: -120,
        y: 70,
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
        unitId: "enemy-01",
        name: "E_01",
        teamId: "enemy",
        x: 130,
        y: -80,
        unitRadius: 16,
        hp: 100,
        maxHp: 100,
        atk: 10,
        range: 1.5,
        moveSpeed: 3,
        attackSpeed: 1,
        skillDescription: "",
      },
    ],
  };
};

export const DEFAULT_SCENE = createDefaultScene();

export const cloneScene = (scene: SceneJson): SceneJson => {
  return {
    arena: {
      ...scene.arena,
      center: { ...scene.arena.center },
    },
    teams: scene.teams.map((team) => ({ ...team })),
    units: scene.units.map((unit) => ({ ...unit })),
  };
};

export const createUnitSortOrder = (teams: Team[]) => {
  const order = new Map<string, number>();
  teams.forEach((team, index) => {
    order.set(team.id, index);
  });
  return order;
};

export const toTeamBadgeStyle = (teamColor: string | undefined) => {
  if (!teamColor) {
    return undefined;
  }

  return {
    borderColor: teamColor,
    backgroundColor: `${teamColor}20`,
    color: teamColor,
  };
};

export const formatSavedLabel = (date: Date): string => {
  return date.toLocaleString("ko-KR", {
    hour12: false,
  });
};

export const toValidNumericValue = (
  field: EditableNumericField,
  rawValue: string,
) => {
  const parsed = Number(rawValue);
  const minimum = FIELD_MINIMUM[field];

  if (!Number.isFinite(parsed)) {
    return minimum;
  }

  return Math.max(minimum, parsed);
};

export const toFiniteNumber = (rawValue: string): number => {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
};

export const clampNumber = (
  value: number,
  min: number,
  max: number,
): number => {
  return Math.min(max, Math.max(min, value));
};

export const buildNumericPatch = <K extends EditableNumericField>(
  field: K,
  value: number,
): Pick<Unit, K> => {
  return { [field]: value } as Pick<Unit, K>;
};
