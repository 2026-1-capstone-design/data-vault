"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Field, FieldGroup } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import { OptionalTag } from "./optional-tag";

export const GladiatorActionSection = () => {
  const { gladiatorActionPrompt, setGladiatorActionPrompt } =
    useDatasetContext();

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor="gladiator-action-prompt">
          검투사 행동 지시 <OptionalTag />
        </Label>
        <Textarea
          id="gladiator-action-prompt"
          placeholder="검투사가 어느 행동을 취할지 지시하는 프롬프트를 입력하세요"
          value={gladiatorActionPrompt}
          onChange={(e) => setGladiatorActionPrompt(e.target.value)}
        />
      </Field>
    </FieldGroup>
  );
};
