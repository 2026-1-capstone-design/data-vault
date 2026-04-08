"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { clampUnitPositionToArena } from "~/lib/battle-situations/arena";
import {
  useCreateBattleSimulation,
  useUpdateBattleSimulation,
} from "~/lib/battle-situations/mutations";
import { useBattleSituation } from "~/lib/battle-situations/queries";
import {
  addUnit,
  moveUnit,
  updateUnit,
} from "~/lib/battle-situations/scene-editor";
import { toSemantic } from "~/lib/battle-situations/transform";
import type { Scene } from "~/lib/battle-situations/types";
import { validateScene } from "~/lib/battle-situations/validation";

import { ApiErrorDialog } from "./ApiErrorDialog";
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
  createUnitSortOrder,
  DEFAULT_SCENE,
  formatSavedLabel,
  type EditableNumericField,
  type PositionAxis,
  toFiniteNumber,
  toValidNumericValue,
} from "./battle-editor.shared";
import { DbInteractionOverlay } from "./DbInteractionOverlay";

const DEFAULT_TITLE = "";
const DEFAULT_DESCRIPTION = "";

export const BattleEditor = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const battleSituationId = searchParams.get("battleSituationId");

  const createMutation = useCreateBattleSimulation();
  const updateMutation = useUpdateBattleSimulation();
  const battleSituationQuery = useBattleSituation({
    variables: { id: battleSituationId ?? "" },
    enabled: Boolean(battleSituationId),
  });

  const [scene, setScene] = useState<Scene>(() =>
    structuredClone(DEFAULT_SCENE),
  );
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    DEFAULT_SCENE.units[0]?.unitId,
  );
  const [statusText, setStatusText] = useState("씬 편집 준비 완료");
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serializeEditorState(DEFAULT_SCENE, DEFAULT_TITLE, DEFAULT_DESCRIPTION),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissedQueryError, setDismissedQueryError] = useState<unknown>(null);

  const serializedScene = useMemo(
    () => serializeEditorState(scene, title, description),
    [scene, title, description],
  );
  const isDirty = serializedScene !== savedSnapshot;

  if (!battleSituationId) {
    if (loadedId !== null) {
      const nextScene = structuredClone(DEFAULT_SCENE);
      const nextSnapshot = serializeEditorState(
        nextScene,
        DEFAULT_TITLE,
        DEFAULT_DESCRIPTION,
      );
      setScene(nextScene);
      setTitle(DEFAULT_TITLE);
      setDescription(DEFAULT_DESCRIPTION);
      setSelectedUnitId(nextScene.units[0]?.unitId);
      setLoadedId(null);
      setSavedSnapshot(nextSnapshot);
      setStatusText("신규 등록 모드로 전환했습니다.");
    }
  }

  const teamMap = useMemo(() => {
    return new Map(scene.teams.map((team) => [team.id, team]));
  }, [scene.teams]);

  const modeText = battleSituationId ? "수정 모드" : "신규 등록 모드";
  const isDbPending =
    battleSituationQuery.isFetching ||
    createMutation.isPending ||
    updateMutation.isPending;
  const queryErrorMessage =
    battleSituationQuery.error != null &&
    battleSituationQuery.error !== dismissedQueryError
      ? toUserMessage(battleSituationQuery.error)
      : null;
  const activeErrorMessage = errorMessage ?? queryErrorMessage;

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

  const syncScene = useCallback(() => {
    if (!battleSituationId) {
      if (loadedId !== null) {
        const nextScene = structuredClone(DEFAULT_SCENE);
        const nextSnapshot = serializeEditorState(
          nextScene,
          DEFAULT_TITLE,
          DEFAULT_DESCRIPTION,
        );
        setScene(nextScene);
        setTitle(DEFAULT_TITLE);
        setDescription(DEFAULT_DESCRIPTION);
        setSelectedUnitId(nextScene.units[0]?.unitId);
        setLoadedId(null);
        setSavedSnapshot(nextSnapshot);
        setStatusText("신규 등록 모드로 전환했습니다.");
      }
      return;
    }

    if (battleSituationId === loadedId) {
      return;
    }

    const response = battleSituationQuery.data;
    if (!response || response.id == null) {
      return;
    }

    const nextScene = response.sceneJson;
    const nextTitle = response.title ?? DEFAULT_TITLE;
    const nextDescription = response.description ?? DEFAULT_DESCRIPTION;
    const nextSnapshot = serializeEditorState(
      nextScene,
      nextTitle,
      nextDescription,
    );

    setScene(nextScene);
    setTitle(nextTitle);
    setDescription(nextDescription);
    setSelectedUnitId(nextScene.units[0]?.unitId);
    setLoadedId(response.id);
    setSavedSnapshot(nextSnapshot);
    setStatusText("전장 상황을 불러왔습니다.");
  }, [battleSituationId, battleSituationQuery.data, loadedId]);

  syncScene();

  const handleReset = () => {
    const nextScene = structuredClone(DEFAULT_SCENE);
    setScene(nextScene);
    setTitle(DEFAULT_TITLE);
    setDescription(DEFAULT_DESCRIPTION);
    setSelectedUnitId(nextScene.units[0]?.unitId);
    setStatusText("초기 배치로 되돌렸습니다.");
  };

  const handleSave = async () => {
    const validation = validateScene(scene);
    if (!validation.ok) {
      setStatusText(`저장 실패: ${validation.errors.join(" / ")}`);
      return;
    }

    try {
      const payload = buildSavePayload(scene, title, description);
      const response = battleSituationId
        ? await updateMutation.mutateAsync({
            id: battleSituationId,
            ...payload,
          })
        : await createMutation.mutateAsync(payload);

      const savedId = response.id;
      setLoadedId(savedId);
      setSavedSnapshot(serializedScene);

      if (battleSituationId !== savedId) {
        router.replace(
          `/battle-situation-builder?battleSituationId=${savedId}`,
        );
      }

      setStatusText(`저장 완료 (${formatSavedLabel(new Date())})`);
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    }
  };

  const handleSaveAs = async () => {
    const validation = validateScene(scene);
    if (!validation.ok) {
      setStatusText(
        `다른 이름으로 저장 실패: ${validation.errors.join(" / ")}`,
      );
      return;
    }

    try {
      const payload = buildSavePayload(scene, title, description);
      const response = await createMutation.mutateAsync(payload);

      const savedId = response.id;
      setLoadedId(savedId);
      setSavedSnapshot(serializedScene);
      router.replace(`/battle-situation-builder?battleSituationId=${savedId}`);
      setStatusText(`새 전장으로 저장 완료 (${formatSavedLabel(new Date())})`);
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    }
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
    <>
      <DbInteractionOverlay open={isDbPending} />
      <ApiErrorDialog
        open={Boolean(activeErrorMessage)}
        message={activeErrorMessage ?? ""}
        onClose={() => {
          setErrorMessage(null);
          setDismissedQueryError(battleSituationQuery.error);
        }}
      />

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
              modeText={modeText}
              titleValue={title}
              descriptionValue={description}
              isPending={isDbPending}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
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
    </>
  );
};

function buildSavePayload(scene: Scene, title: string, description: string) {
  const allyCount = scene.units.filter((unit) => unit.teamId === "ally").length;
  const enemyCount = scene.units.filter(
    (unit) => unit.teamId === "enemy",
  ).length;

  return {
    title: title.trim().length > 0 ? title.trim() : null,
    description: description.trim(),
    sceneJson: scene,
    semanticJson: toSemantic(scene),
    allyCount,
    enemyCount,
    totalCount: allyCount + enemyCount,
  };
}

function serializeEditorState(
  scene: Scene,
  title: string,
  description: string,
): string {
  return JSON.stringify({
    scene,
    title,
    description,
  });
}

function toUserMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}
