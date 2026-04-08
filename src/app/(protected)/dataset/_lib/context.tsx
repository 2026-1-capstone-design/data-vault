"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

import type { DatasetSample } from "~/lib/dataset/build-prompt";
import { createContext } from "~/shared/react";

export type BattleMode = "auto" | "builder";

interface DatasetContextValue {
  personaPrompt: string;
  setPersonaPrompt: Dispatch<SetStateAction<string>>;
  usePersonaAsIs: boolean;
  setUsePersonaAsIs: Dispatch<SetStateAction<boolean>>;

  battleMode: BattleMode;
  setBattleMode: Dispatch<SetStateAction<BattleMode>>;
  enemyCount: string;
  setEnemyCount: Dispatch<SetStateAction<string>>;
  allyCount: string;
  setAllyCount: Dispatch<SetStateAction<string>>;
  battleDescription: string;
  setBattleDescription: Dispatch<SetStateAction<string>>;

  commanderOrderPrompt: string;
  setCommanderOrderPrompt: Dispatch<SetStateAction<string>>;

  willDisobeyCommand: boolean;
  setWillDisobeyCommand: Dispatch<SetStateAction<boolean>>;

  gladiatorActionPrompt: string;
  setGladiatorActionPrompt: Dispatch<SetStateAction<string>>;

  dialoguePrompt: string;
  setDialoguePrompt: Dispatch<SetStateAction<string>>;

  result: DatasetSample | null;
  setResult: Dispatch<SetStateAction<DatasetSample | null>>;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}

export const [DatasetContext, useDatasetContext] =
  createContext<DatasetContextValue>(
    "useDatasetContext must be used within DatasetProvider",
  );

export const DatasetProvider = ({ children }: PropsWithChildren) => {
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [usePersonaAsIs, setUsePersonaAsIs] = useState(false);

  const [battleMode, setBattleMode] = useState<BattleMode>("auto");
  const [enemyCount, setEnemyCount] = useState("");
  const [allyCount, setAllyCount] = useState("");
  const [battleDescription, setBattleDescription] = useState("");

  const [commanderOrderPrompt, setCommanderOrderPrompt] = useState("");

  const [willDisobeyCommand, setWillDisobeyCommand] = useState(false);

  const [gladiatorActionPrompt, setGladiatorActionPrompt] = useState("");

  const [dialoguePrompt, setDialoguePrompt] = useState("");

  const [result, setResult] = useState<DatasetSample | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      personaPrompt,
      setPersonaPrompt,
      usePersonaAsIs,
      setUsePersonaAsIs,
      battleMode,
      setBattleMode,
      enemyCount,
      setEnemyCount,
      allyCount,
      setAllyCount,
      battleDescription,
      setBattleDescription,
      commanderOrderPrompt,
      setCommanderOrderPrompt,
      willDisobeyCommand,
      setWillDisobeyCommand,
      gladiatorActionPrompt,
      setGladiatorActionPrompt,
      dialoguePrompt,
      setDialoguePrompt,
      result,
      setResult,
      errorMessage,
      setErrorMessage,
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
      result,
      errorMessage,
    ],
  );

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
};
