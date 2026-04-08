"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Label } from "~/components/ui/label";

export const DisobeyCommandSection = () => {
  const { willDisobeyCommand, setWillDisobeyCommand } = useDatasetContext();

  return (
    <Field orientation="horizontal">
      <Checkbox
        id="will-disobey-command"
        checked={willDisobeyCommand}
        onCheckedChange={(checked) => setWillDisobeyCommand(!!checked)}
      />
      <Label
        htmlFor="will-disobey-command"
        className="cursor-pointer font-normal"
      >
        명령 불복종
      </Label>
    </Field>
  );
};
