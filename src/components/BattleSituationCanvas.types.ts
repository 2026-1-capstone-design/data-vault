import type { SceneJson } from "~/lib/battle-situation-builder/model";

export type BattleSituationCanvasProps = {
  scene: SceneJson;
  width?: number;
  height?: number;
  draggable?: boolean;
  selectedUnitId?: string;
  onUnitPress?: (unitId: string) => void;
  onEmptyPress?: () => void;
  onUnitMove?: (
    unitId: string,
    position: {
      x: number;
      y: number;
    },
  ) => void;
};
