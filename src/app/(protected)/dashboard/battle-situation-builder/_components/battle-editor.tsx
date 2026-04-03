"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ApiErrorDialog } from "~/components/ApiErrorDialog";
import { DbInteractionOverlay } from "~/components/DbInteractionOverlay";
import { clampUnitPositionToArena } from "~/lib/battle-situation-builder/arena";
import type { SceneJson } from "~/lib/battle-situation-builder/model";
import {
  addUnit,
  moveUnit,
  updateUnit,
} from "~/lib/battle-situation-builder/scene-editor";
import { toSemantic } from "~/lib/battle-situation-builder/transform";
import { validateScene } from "~/lib/battle-situation-builder/validation";
import { requestJson } from "~/shared/network/request-json";

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

type BattleSituationApiItem = {
  id: string;
  title: string | null;
  description: string;
  sceneJson: SceneJson;
  semanticJson: Record<string, unknown>;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_TITLE = "";
const DEFAULT_DESCRIPTION = "";

export const BattleEditor = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const battleSituationId = searchParams.get("battleSituationId");

  const [scene, setScene] = useState<SceneJson>(() =>
    cloneScene(DEFAULT_SCENE),
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
  const [isDbPending, setIsDbPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const serializedScene = useMemo(
    () => serializeEditorState(scene, title, description),
    [scene, title, description],
  );
  const isDirty = serializedScene !== savedSnapshot;

  const teamMap = useMemo(() => {
    return new Map(scene.teams.map((team) => [team.id, team]));
  }, [scene.teams]);

  const modeText = battleSituationId ? "수정 모드" : "신규 등록 모드";

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

  useEffect(() => {
    if (!battleSituationId) {
      if (loadedId !== null) {
        const nextScene = cloneScene(DEFAULT_SCENE);
        setScene(nextScene);
        setTitle(DEFAULT_TITLE);
        setDescription(DEFAULT_DESCRIPTION);
        setSelectedUnitId(nextScene.units[0]?.unitId);
        setLoadedId(null);
        const nextSnapshot = serializeEditorState(
          nextScene,
          DEFAULT_TITLE,
          DEFAULT_DESCRIPTION,
        );
        setSavedSnapshot(nextSnapshot);
        setStatusText("신규 등록 모드로 전환했습니다.");
      }
      return;
    }

    if (battleSituationId === loadedId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsDbPending(true);
      try {
        const response = await requestJson<BattleSituationApiItem>(
          `/api/battle-situations/${battleSituationId}`,
        );

        if (cancelled) {
          return;
        }

        const nextScene = ensureScene(response.data.sceneJson);
        const nextTitle = response.data.title ?? DEFAULT_TITLE;
        const nextDescription =
          response.data.description ?? DEFAULT_DESCRIPTION;

        setScene(nextScene);
        setTitle(nextTitle);
        setDescription(nextDescription);
        setSelectedUnitId(nextScene.units[0]?.unitId);
        setLoadedId(response.data.id);
        setSavedSnapshot(
          serializeEditorState(nextScene, nextTitle, nextDescription),
        );
        setStatusText("전장 상황을 불러왔습니다.");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toUserMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsDbPending(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [battleSituationId, loadedId]);

  const handleReset = () => {
    const nextScene = cloneScene(DEFAULT_SCENE);
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

    await runDbAction(async () => {
      const payload = buildSavePayload(scene, title, description);
      const endpoint = battleSituationId
        ? `/api/battle-situations/${battleSituationId}`
        : "/api/battle-situations";
      const method = battleSituationId ? "PATCH" : "POST";

      const response = await requestJson<BattleSituationApiItem>(endpoint, {
        method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const savedId = response.data.id;
      setLoadedId(savedId);
      setSavedSnapshot(serializedScene);

      if (battleSituationId !== savedId) {
        router.replace(
          `/dashboard/battle-situation-builder?battleSituationId=${savedId}`,
        );
      }

      setStatusText(`저장 완료 (${formatSavedLabel(new Date())})`);
    });
  };

  const handleSaveAs = async () => {
    const validation = validateScene(scene);
    if (!validation.ok) {
      setStatusText(
        `다른 이름으로 저장 실패: ${validation.errors.join(" / ")}`,
      );
      return;
    }

    await runDbAction(async () => {
      const payload = buildSavePayload(scene, title, description);
      const response = await requestJson<BattleSituationApiItem>(
        "/api/battle-situations",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const savedId = response.data.id;
      setLoadedId(savedId);
      setSavedSnapshot(serializedScene);
      router.replace(
        `/dashboard/battle-situation-builder?battleSituationId=${savedId}`,
      );
      setStatusText(`새 전장으로 저장 완료 (${formatSavedLabel(new Date())})`);
    });
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

  const runDbAction = async (work: () => Promise<void>) => {
    setIsDbPending(true);
    try {
      await work();
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    } finally {
      setIsDbPending(false);
    }
  };

  return (
    <>
      <DbInteractionOverlay open={isDbPending} />
      <ApiErrorDialog
        open={Boolean(errorMessage)}
        message={errorMessage ?? ""}
        onClose={() => setErrorMessage(null)}
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

function ensureScene(value: unknown): SceneJson {
  if (
    typeof value === "object" &&
    value !== null &&
    "arena" in value &&
    "teams" in value &&
    "units" in value
  ) {
    return cloneScene(value as SceneJson);
  }

  return cloneScene(DEFAULT_SCENE);
}

function buildSavePayload(
  scene: SceneJson,
  title: string,
  description: string,
) {
  return {
    title: title.trim().length > 0 ? title.trim() : null,
    description: description.trim(),
    sceneJson: scene,
    semanticJson: toSemantic(scene),
  };
}

function serializeEditorState(
  scene: SceneJson,
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
