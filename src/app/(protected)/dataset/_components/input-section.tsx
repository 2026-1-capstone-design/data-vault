"use client";

import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

import { BattleSection } from "./input-battle-section";
import { CommanderOrderSection } from "./input-commander-order-section";
import { DialogueSection } from "./input-dialogue-section";
import { DisobeyCommandSection } from "./input-disobey-command-section";
import { GladiatorActionSection } from "./input-gladiator-action-section";
import { PersonaSection } from "./input-persona-section";

export const InputSection = () => {
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
      <Button size="lg" className="m-4">
        만들기
      </Button>
    </div>
  );
};
