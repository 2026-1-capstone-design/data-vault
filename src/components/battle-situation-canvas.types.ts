import type { Scene } from "~/lib/battle-situations/types";

export type BattleSituationCanvasProps = {
  scene: Scene;
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
