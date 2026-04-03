"use client";

import { useMemo, useState } from "react";

import { clampUnitPositionToArena } from "~/lib/battle-situation-builder/arena";
import type { SceneJson } from "~/lib/battle-situation-builder/model";
import {
  addUnit,
  moveUnit,
  updateUnit,
} from "~/lib/battle-situation-builder/scene-editor";
import { validateScene } from "~/lib/battle-situation-builder/validation";

import { BattleEditorCanvasPanel } from "./battle-editor-canvas-panel";
import { BattleEditorControlsCard } from "./battle-editor-controls-card";
import { BattleEditorUnitCreateCard } from "./battle-editor-unit-create-card";
import { BattleEditorUnitInspector } from "./battle-editor-unit-inspector";
import {
  ARENA_RADIUS_MAX,
  ARENA_RADIUS_MIN,
  ARENA_RADIUS_STEP,
  buildNumericPatch,
  clampNumber,
  cloneScene,
  createUnitSortOrder,
  DEFAULT_SCENE,
  formatSavedLabel,
  type EditableNumericField,
  type PositionAxis,
  toFiniteNumber,
  toValidNumericValue,
} from "./battle-editor.shared";

export const BattleEditor = () => {
  const [scene, setScene] = useState<SceneJson>(() =>
    cloneScene(DEFAULT_SCENE),
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    DEFAULT_SCENE.units[0]?.unitId,
  );
  const [statusText, setStatusText] = useState("씬 편집 준비 완료");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(DEFAULT_SCENE),
  );

  const serializedScene = useMemo(() => JSON.stringify(scene), [scene]);
  const isDirty = serializedScene !== savedSnapshot;

  const teamMap = useMemo(() => {
    return new Map(scene.teams.map((team) => [team.id, team]));
  }, [scene.teams]);

  const sortedUnits = useMemo(() => {
    const teamOrder = createUnitSortOrder(scene.teams);
    const readNameSequence = (name: string): number => {
      const [, rawSequence] = name.split("_");
      const sequence = Number.parseInt(rawSequence ?? "", 10);
      return Number.isFinite(sequence) ? sequence : Number.MAX_SAFE_INTEGER;
    };

    return [...scene.units].sort((left, right) => {
      if (selectedUnitId) {
        const leftSelected = left.unitId === selectedUnitId;
        const rightSelected = right.unitId === selectedUnitId;
        if (leftSelected && !rightSelected) {
          return -1;
        }
        if (!leftSelected && rightSelected) {
          return 1;
        }
      }

      const byTeam =
        (teamOrder.get(left.teamId) ?? Number.MAX_SAFE_INTEGER) -
        (teamOrder.get(right.teamId) ?? Number.MAX_SAFE_INTEGER);

      if (byTeam !== 0) {
        return byTeam;
      }

      const bySequence =
        readNameSequence(left.name) - readNameSequence(right.name);
      if (bySequence !== 0) {
        return bySequence;
      }

      return left.name.localeCompare(right.name, "ko");
    });
  }, [scene.teams, scene.units, selectedUnitId]);

  const handleReset = () => {
    const nextScene = cloneScene(DEFAULT_SCENE);
    setScene(nextScene);
    setSelectedUnitId(nextScene.units[0]?.unitId);
    setStatusText("초기 배치로 되돌렸습니다.");
  };

  const handleSave = () => {
    const validation = validateScene(scene);
    if (!validation.ok) {
      setStatusText(`저장 실패: ${validation.errors.join(" / ")}`);
      return;
    }

    setSavedSnapshot(serializedScene);
    setStatusText(`저장 완료 (${formatSavedLabel(new Date())})`);
  };

  const handleSaveAs = () => {
    const validation = validateScene(scene);
    if (!validation.ok) {
      setStatusText(
        `다른 이름으로 저장 실패: ${validation.errors.join(" / ")}`,
      );
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `battle-situation-${timestamp}.json`;
    const blob = new Blob([JSON.stringify(scene, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);

    setSavedSnapshot(serializedScene);
    setStatusText(`"${filename}"로 내보냈습니다.`);
  };

  const handleAddUnit = (teamId: string) => {
    const added = addUnit(scene, teamId);
    if (!added.unitId) {
      setStatusText(`팀을 찾을 수 없어 생성하지 못했습니다: ${teamId}`);
      return;
    }

    setScene(added.scene);
    setSelectedUnitId(added.unitId);
    setStatusText(
      `${teamMap.get(teamId)?.label ?? teamId} 유닛을 생성했습니다.`,
    );
  };

  const handleArenaRadiusChange = (values: number[]) => {
    const nextRadiusRaw = values[0];
    if (typeof nextRadiusRaw !== "number" || !Number.isFinite(nextRadiusRaw)) {
      return;
    }

    const nextRadius = clampNumber(
      Math.round(nextRadiusRaw / ARENA_RADIUS_STEP) * ARENA_RADIUS_STEP,
      ARENA_RADIUS_MIN,
      ARENA_RADIUS_MAX,
    );

    setScene((current) => {
      const nextArena = {
        ...current.arena,
        radius: nextRadius,
      };

      const nextUnits = current.units.map((unit) => {
        const clamped = clampUnitPositionToArena(nextArena, {
          x: unit.x,
          y: unit.y,
          unitRadius: unit.unitRadius,
        });

        return {
          ...unit,
          x: clamped.x,
          y: clamped.y,
        };
      });

      return {
        ...current,
        arena: nextArena,
        units: nextUnits,
      };
    });
  };

  const handleCanvasMove = (
    unitId: string,
    position: {
      x: number;
      y: number;
    },
  ) => {
    setScene((current) =>
      moveUnit(current, unitId, {
        x: Math.round(position.x),
        y: Math.round(position.y),
      }),
    );
  };

  const handleNumericFieldChange = (
    unitId: string,
    field: EditableNumericField,
    rawValue: string,
  ) => {
    const nextValue = toValidNumericValue(field, rawValue);

    setScene((current) => {
      const target = current.units.find((unit) => unit.unitId === unitId);
      if (!target) {
        return current;
      }

      if (field === "maxHp") {
        return updateUnit(current, unitId, {
          maxHp: nextValue,
          hp: Math.min(target.hp, nextValue),
        });
      }

      if (field === "hp") {
        return updateUnit(current, unitId, {
          hp: Math.min(nextValue, target.maxHp),
        });
      }

      return updateUnit(current, unitId, buildNumericPatch(field, nextValue));
    });
  };

  const handleSkillDescriptionChange = (unitId: string, value: string) => {
    setScene((current) =>
      updateUnit(current, unitId, {
        skillDescription: value,
      }),
    );
  };

  const handlePositionChange = (
    unitId: string,
    axis: PositionAxis,
    rawValue: string,
  ) => {
    const nextValue = Math.round(toFiniteNumber(rawValue));

    setScene((current) => {
      const target = current.units.find((unit) => unit.unitId === unitId);
      if (!target) {
        return current;
      }

      return moveUnit(current, unitId, {
        x: axis === "x" ? nextValue : target.x,
        y: axis === "y" ? nextValue : target.y,
      });
    });
  };

  return (
    <div className="animate-in fade-in-0 flex w-full duration-500">
      <div
        className="grid w-full grid-cols-[minmax(0,3fr)_minmax(0,2fr)]
          items-start gap-4"
      >
        <BattleEditorCanvasPanel
          scene={scene}
          isDirty={isDirty}
          selectedUnitId={selectedUnitId}
          onUnitPress={setSelectedUnitId}
          onCanvasEmptyPress={() => setSelectedUnitId(undefined)}
          onUnitMove={handleCanvasMove}
          onArenaRadiusChange={handleArenaRadiusChange}
        />

        <section className="flex flex-col gap-4 pt-1">
          <BattleEditorControlsCard
            statusText={statusText}
            onReset={handleReset}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
          />

          <BattleEditorUnitCreateCard onAddUnit={handleAddUnit} />

          <BattleEditorUnitInspector
            units={sortedUnits}
            teamMap={teamMap}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            onPositionChange={handlePositionChange}
            onNumericFieldChange={handleNumericFieldChange}
            onSkillDescriptionChange={handleSkillDescriptionChange}
          />
        </section>
      </div>
    </div>
  );
};
