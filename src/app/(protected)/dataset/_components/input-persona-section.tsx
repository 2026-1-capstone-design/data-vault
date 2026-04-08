"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldGroup } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import { OptionalTag } from "./optional-tag";

export const PersonaSection = () => {
  const { personaPrompt, setPersonaPrompt, usePersonaAsIs, setUsePersonaAsIs } =
    useDatasetContext();

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor="persona-prompt">
          페르소나 생성 프롬프트 <OptionalTag />
        </Label>
        <Textarea
          id="persona-prompt"
          placeholder="예) 야만적인 전사"
          value={personaPrompt}
          onChange={(e) => setPersonaPrompt(e.target.value)}
        />
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id="use-persona-as-is"
          checked={usePersonaAsIs}
          onCheckedChange={(checked) => setUsePersonaAsIs(!!checked)}
        />
        <Label
          htmlFor="use-persona-as-is"
          className="cursor-pointer font-normal"
        >
          입력 그대로 사용 <br />
          (미체크 시 Gemini API로 가공)
        </Label>
      </Field>
    </FieldGroup>
  );
};
