export type Arena = {
  shape: "circle";
  center: {
    x: number;
    y: number;
  };
  radius: number;
};

export type Team = {
  id: string;
  label: string;
  color: string;
  namePrefix: string;
};

export type Unit = {
  unitId: string;
  name: string;
  teamId: string;
  x: number;
  y: number;
  unitRadius: number;
  hp: number;
  maxHp: number;
  atk: number;
  range: number;
  moveSpeed: number;
  attackSpeed: number;
  skillDescription?: string;
};

export type SceneJson = {
  arena: Arena;
  teams: Team[];
  units: Unit[];
};

export type SemanticUnit = {
  unitId: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  stats: {
    hp: number;
    atk: number;
    range: number;
  };
  skillDescription: string;
};

export type SemanticJson = {
  arena: Arena;
  allies: SemanticUnit[];
  enemies: SemanticUnit[];
};
