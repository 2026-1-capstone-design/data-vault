import { battleSituationRouter } from "~/lib/battle-situations/router";
import { datasetRouter } from "~/lib/dataset/router";
import { createTRPCRouter } from "~/lib/trpc/init";

export const appRouter = createTRPCRouter({
  battleSituation: battleSituationRouter,
  dataset: datasetRouter,
});

export type AppRouter = typeof appRouter;
