"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Field, FieldGroup } from "~/components/ui/field";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import { OptionalTag } from "./optional-tag";

export const DialogueSection = () => {
  const { dialoguePrompt, setDialoguePrompt } = useDatasetContext();

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor="dialogue-prompt">
          대사 <OptionalTag />
        </Label>
        <Textarea
          id="dialogue-prompt"
          placeholder="대사를 입력하세요"
          value={dialoguePrompt}
          onChange={(e) => setDialoguePrompt(e.target.value)}
        />
      </Field>
    </FieldGroup>
  );
};
