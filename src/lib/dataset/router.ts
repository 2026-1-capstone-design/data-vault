import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { baseProcedure, createTRPCRouter } from "~/lib/trpc/init";
import { generateJson } from "~/shared/gemini/client";

import { buildDatasetPrompt, type DatasetSample } from "./build-prompt";

const datasetPromptInputSchema = z.object({
  personaPrompt: z.string(),
  usePersonaAsIs: z.boolean(),

  battleMode: z.enum(["auto", "builder"]),
  enemyCount: z.string(),
  allyCount: z.string(),
  battleDescription: z.string(),

  commanderOrderPrompt: z.string(),
  willDisobeyCommand: z.boolean(),

  gladiatorActionPrompt: z.string(),
  dialoguePrompt: z.string(),
});

export const datasetRouter = createTRPCRouter({
  generate: baseProcedure
    .input(datasetPromptInputSchema)
    .mutation(async ({ input }) => {
      try {
        const prompt = buildDatasetPrompt(input);
        const sample = await generateJson<DatasetSample>(prompt);
        return sample;
      } catch (error) {
        console.error("Failed to generate dataset sample:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate dataset sample",
        });
      }
    }),
});
