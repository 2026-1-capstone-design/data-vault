import { BattleSituationCanvas } from "~/components/BattleSituationCanvas";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import type { Scene } from "~/lib/battle-situations/types";
import { cn } from "~/shared/utils";

import {
  ARENA_RADIUS_MAX,
  ARENA_RADIUS_MIN,
  ARENA_RADIUS_STEP,
} from "./battle-editor.shared";

type BattleEditorCanvasPanelProps = {
  scene: Scene;
  isDirty: boolean;
  selectedUnitId?: string;
  onUnitPress: (unitId: string) => void;
  onCanvasEmptyPress: () => void;
  onUnitMove: (
    unitId: string,
    position: {
      x: number;
      y: number;
    },
  ) => void;
  onArenaRadiusChange: (values: number[]) => void;
};

export const BattleEditorCanvasPanel = ({
  scene,
  isDirty,
  selectedUnitId,
  onUnitPress,
  onCanvasEmptyPress,
  onUnitMove,
  onArenaRadiusChange,
}: BattleEditorCanvasPanelProps) => {
  return (
    <section
      className="border-border/70 relative h-[calc(100vh-8rem)] min-h-0
        overflow-hidden rounded-2xl border p-4"
    >
      <div className="pointer-events-none absolute inset-0" />

      <div className="relative flex h-full min-h-0 flex-col gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p
                className="text-muted-foreground text-[11px] tracking-[0.2em]
                  uppercase"
              >
                Battlefield Canvas
              </p>
              <p className="text-sm font-medium">원형 전장 편집 화면</p>
            </div>
            <span
              className={cn(
                `inline-flex rounded-full border px-2.5 py-1 text-xs
                font-medium`,
                isDirty
                  ? "border-amber-300 bg-amber-100 text-amber-900"
                  : "border-emerald-300 bg-emerald-100 text-emerald-900",
              )}
            >
              {isDirty ? "수정됨" : "저장됨"}
            </span>
          </div>

          <div className="py-2">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs">경기장 radius</Label>
              <span className="text-muted-foreground text-xs tabular-nums">
                {scene.arena.radius}
              </span>
            </div>
            <Slider
              min={ARENA_RADIUS_MIN}
              max={ARENA_RADIUS_MAX}
              step={ARENA_RADIUS_STEP}
              value={[scene.arena.radius]}
              onValueChange={onArenaRadiusChange}
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white/80 p-2"
        >
          <BattleSituationCanvas
            scene={scene}
            selectedUnitId={selectedUnitId}
            onUnitPress={onUnitPress}
            onEmptyPress={onCanvasEmptyPress}
            onUnitMove={onUnitMove}
          />
        </div>

        <p className="text-muted-foreground text-xs">
          유닛을 드래그해 배치하고, 우측 카드에서 수치를 바로 수정하세요.
        </p>
      </div>
    </section>
  );
};
