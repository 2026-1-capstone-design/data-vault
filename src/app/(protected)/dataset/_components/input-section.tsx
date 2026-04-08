"use client";

import { useMemo } from "react";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { buildDatasetPrompt } from "~/lib/dataset/build-prompt";
import { useGenerateDatasetSample } from "~/lib/dataset/mutations";

import { BattleSection } from "./input-battle-section";
import { CommanderOrderSection } from "./input-commander-order-section";
import { DialogueSection } from "./input-dialogue-section";
import { DisobeyCommandSection } from "./input-disobey-command-section";
import { GladiatorActionSection } from "./input-gladiator-action-section";
import { PersonaSection } from "./input-persona-section";

export const InputSection = () => {
  const {
    personaPrompt,
    usePersonaAsIs,
    battleMode,
    enemyCount,
    allyCount,
    battleDescription,
    commanderOrderPrompt,
    willDisobeyCommand,
    gladiatorActionPrompt,
    dialoguePrompt,
    setResult,
    setErrorMessage,
  } = useDatasetContext();

  const { mutate, isPending } = useGenerateDatasetSample();

  const prompt = useMemo(
    () =>
      buildDatasetPrompt({
        personaPrompt,
        usePersonaAsIs,
        battleMode,
        enemyCount,
        allyCount,
        battleDescription,
        commanderOrderPrompt,
        willDisobeyCommand,
        gladiatorActionPrompt,
        dialoguePrompt,
      }),
    [
      personaPrompt,
      usePersonaAsIs,
      battleMode,
      enemyCount,
      allyCount,
      battleDescription,
      commanderOrderPrompt,
      willDisobeyCommand,
      gladiatorActionPrompt,
      dialoguePrompt,
    ],
  );

  const handleGenerate = () => {
    setErrorMessage(null);
    mutate(
      {
        personaPrompt,
        usePersonaAsIs,
        battleMode,
        enemyCount,
        allyCount,
        battleDescription,
        commanderOrderPrompt,
        willDisobeyCommand,
        gladiatorActionPrompt,
        dialoguePrompt,
      },
      {
        onSuccess: (data) => {
          setResult(data);
        },
        onError: (error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "데이터셋 생성에 실패했습니다.",
          );
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border">
      <ScrollArea className="h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          <PersonaSection />
          <Separator />
          <BattleSection />
          <Separator />
          <CommanderOrderSection />
          <Separator />
          <DisobeyCommandSection />
          <Separator />
          <GladiatorActionSection />
          <Separator />
          <DialogueSection />
        </div>
      </ScrollArea>
      <div className="mx-4 flex flex-col gap-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="prompt-preview" className="rounded-lg border">
            <AccordionTrigger className="px-3 py-2 text-sm">
              Gemini 프롬프트 미리보기
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold">
                    System Instruction
                  </span>
                  <pre
                    className="bg-muted/30 max-h-64 overflow-auto rounded-md
                      border p-2 text-xs whitespace-pre-wrap"
                  >
                    {prompt.systemInstruction}
                  </pre>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold">
                    User Prompt
                  </span>
                  <pre
                    className="bg-muted/30 max-h-64 overflow-auto rounded-md
                      border p-2 text-xs whitespace-pre-wrap"
                  >
                    {prompt.userPrompt}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Button
        size="lg"
        className="mx-4 mb-4"
        onClick={handleGenerate}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Spinner />
            생성 중...
          </>
        ) : (
          "만들기"
        )}
      </Button>
    </div>
  );
};
