"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Field, FieldGroup } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import { OptionalTag } from "./optional-tag";

export const CommanderOrderSection = () => {
  const { commanderOrderPrompt, setCommanderOrderPrompt } = useDatasetContext();

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor="commander-order-prompt">
          지휘관의 명령 생성 프롬프트 <OptionalTag />
        </Label>
        <Textarea
          id="commander-order-prompt"
          placeholder="지휘관의 명령을 묘사하는 프롬프트를 입력하세요"
          value={commanderOrderPrompt}
          onChange={(e) => setCommanderOrderPrompt(e.target.value)}
        />
      </Field>
    </FieldGroup>
  );
};
