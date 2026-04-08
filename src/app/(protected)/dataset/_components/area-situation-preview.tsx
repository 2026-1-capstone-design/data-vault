"use client";

import { useMemo, useState } from "react";

import { toTeamBadgeStyle } from "~/components/battle-editor.shared";
import { BattleSituationCanvas } from "~/components/battle-situation-canvas";
import { fromSemanticToScene } from "~/lib/battle-situations/transform";
import type { DatasetSample } from "~/lib/dataset/build-prompt";

type AreaSituation = DatasetSample["user_input"]["area_situation"];

type Props = {
  areaSituation: AreaSituation;
};

export const AreaSituationPreview = ({ areaSituation }: Props) => {
  const scene = useMemo(
    () => fromSemanticToScene(areaSituation),
    [areaSituation],
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    () => scene.units[0]?.unitId,
  );

  const selectedUnit = scene.units.find((u) => u.unitId === selectedUnitId);
  const selectedTeam = selectedUnit
    ? scene.teams.find((t) => t.id === selectedUnit.teamId)
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="h-100 overflow-hidden rounded-xl border bg-white/80 p-2">
        <BattleSituationCanvas
          scene={scene}
          selectedUnitId={selectedUnitId}
          draggable={false}
          onUnitPress={setSelectedUnitId}
          onEmptyPress={() => setSelectedUnitId(undefined)}
        />
      </div>

      {selectedUnit ? (
        <div className="space-y-2 rounded-xl border px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{selectedUnit.unitId}</p>
            <span
              className="inline-flex rounded-full border px-2 py-0.5 text-xs
                font-medium"
              style={toTeamBadgeStyle(selectedTeam?.color)}
            >
              {selectedTeam?.label ?? selectedUnit.teamId}
            </span>
          </div>
          <div
            className="text-muted-foreground grid grid-cols-3 gap-x-4 gap-y-1
              text-xs"
          >
            <span>
              HP{" "}
              <span className="text-foreground font-medium">
                {selectedUnit.hp}
              </span>
            </span>
            <span>
              ATK{" "}
              <span className="text-foreground font-medium">
                {selectedUnit.atk}
              </span>
            </span>
            <span>
              Range{" "}
              <span className="text-foreground font-medium">
                {selectedUnit.range}
              </span>
            </span>
            <span>
              X{" "}
              <span className="text-foreground font-medium tabular-nums">
                {selectedUnit.x}
              </span>
            </span>
            <span>
              Y{" "}
              <span className="text-foreground font-medium tabular-nums">
                {selectedUnit.y}
              </span>
            </span>
          </div>
          {selectedUnit.skillDescription && (
            <p
              className="text-muted-foreground border-t pt-2 text-xs
                leading-relaxed"
            >
              {selectedUnit.skillDescription}
            </p>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground py-2 text-center text-xs">
          유닛을 클릭하면 정보가 표시됩니다.
        </p>
      )}
    </div>
  );
};
