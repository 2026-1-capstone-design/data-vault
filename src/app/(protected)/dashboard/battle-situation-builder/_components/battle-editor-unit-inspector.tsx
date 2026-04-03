import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Clock3,
  FileText,
  Footprints,
  Heart,
  MoveHorizontal,
  MoveVertical,
  Shield,
  Sword,
  Target,
} from "lucide-react";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Team, Unit } from "~/lib/battle-situation-builder/model";
import { cn } from "~/lib/utils";

import type {
  EditableNumericField,
  PositionAxis,
} from "./battle-editor.shared";
import { toTeamBadgeStyle } from "./battle-editor.shared";

type BattleEditorUnitInspectorProps = {
  units: Unit[];
  teamMap: Map<string, Team>;
  selectedUnitId?: string;
  onSelectUnit: (unitId: string) => void;
  onPositionChange: (
    unitId: string,
    axis: PositionAxis,
    rawValue: string,
  ) => void;
  onNumericFieldChange: (
    unitId: string,
    field: EditableNumericField,
    rawValue: string,
  ) => void;
  onSkillDescriptionChange: (unitId: string, value: string) => void;
};

export const BattleEditorUnitInspector = ({
  units,
  teamMap,
  selectedUnitId,
  onSelectUnit,
  onPositionChange,
  onNumericFieldChange,
  onSkillDescriptionChange,
}: BattleEditorUnitInspectorProps) => {
  return (
    <section className="space-y-2">
      <div className="space-y-1 px-1">
        <h2 className="text-base font-semibold">유닛 수정 패널</h2>
        <p className="text-muted-foreground text-sm">
          각 유닛 카드에서 위치/스탯/스킬 설명을 수정할 수 있습니다.
        </p>
      </div>

      <div className="space-y-3 pb-1">
        {units.length === 0 ? (
          <div
            className="border-border text-muted-foreground rounded-xl border
              border-dashed px-4 py-6 text-center text-sm"
          >
            아직 유닛이 없습니다. 위의 생성 버튼으로 시작하세요.
          </div>
        ) : (
          units.map((unit) => {
            const team = teamMap.get(unit.teamId);
            return (
              <article
                key={unit.unitId}
                className={cn(
                  "rounded-xl border px-3 py-3 transition-all",
                  selectedUnitId === unit.unitId
                    ? `border-primary/60 bg-primary/5
                      shadow-[0_0_0_1px_oklch(0.65_0.1_260/0.25)]`
                    : "border-border/70 bg-background",
                )}
                onClick={() => onSelectUnit(unit.unitId)}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{unit.name}</p>
                    <p className="text-muted-foreground text-xs">
                      unitId: {unit.unitId}
                    </p>
                  </div>
                  <span
                    className="inline-flex rounded-full border px-2 py-1 text-xs
                      font-medium"
                    style={toTeamBadgeStyle(team?.color)}
                  >
                    {team?.label ?? unit.teamId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <UnitNumberInput
                    id={`${unit.unitId}-x`}
                    icon={MoveHorizontal}
                    label="X 좌표"
                    value={unit.x}
                    step={1}
                    onChange={(value) =>
                      onPositionChange(unit.unitId, "x", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-y`}
                    icon={MoveVertical}
                    label="Y 좌표"
                    value={unit.y}
                    step={1}
                    onChange={(value) =>
                      onPositionChange(unit.unitId, "y", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-hp`}
                    icon={Heart}
                    label="현재 체력"
                    min={1}
                    max={unit.maxHp}
                    step={1}
                    value={unit.hp}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "hp", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-max-hp`}
                    icon={Shield}
                    label="최대 체력"
                    min={1}
                    step={1}
                    value={unit.maxHp}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "maxHp", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-atk`}
                    icon={Sword}
                    label="ATK"
                    min={0}
                    step={1}
                    value={unit.atk}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "atk", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-range`}
                    icon={Target}
                    label="공격 사거리"
                    min={0}
                    step={0.1}
                    value={unit.range}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "range", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-move-speed`}
                    icon={Footprints}
                    label="이동 속도"
                    min={0}
                    step={0.1}
                    value={unit.moveSpeed}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "moveSpeed", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-attack-speed`}
                    icon={Clock3}
                    label="공격 속도"
                    min={0}
                    step={0.1}
                    value={unit.attackSpeed}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "attackSpeed", value)
                    }
                  />
                  <UnitNumberInput
                    id={`${unit.unitId}-radius`}
                    icon={Circle}
                    label="유닛 반경"
                    min={1}
                    step={1}
                    value={unit.unitRadius}
                    onChange={(value) =>
                      onNumericFieldChange(unit.unitId, "unitRadius", value)
                    }
                  />
                </div>

                <div className="mt-2 space-y-1">
                  <Label
                    htmlFor={`${unit.unitId}-skill`}
                    className="text-muted-foreground gap-1.5 text-xs"
                  >
                    <FileText className="size-3.5" />
                    <span>스킬 설명</span>
                  </Label>
                  <Textarea
                    id={`${unit.unitId}-skill`}
                    rows={2}
                    placeholder="예: 방패 돌진 후 1.2초 기절"
                    value={unit.skillDescription ?? ""}
                    onChange={(event) =>
                      onSkillDescriptionChange(unit.unitId, event.target.value)
                    }
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

type UnitNumberInputProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
};

const UnitNumberInput = ({
  id,
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  onChange,
}: UnitNumberInputProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-muted-foreground gap-1.5 text-xs">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
