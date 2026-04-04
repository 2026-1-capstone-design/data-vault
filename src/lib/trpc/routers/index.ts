import { battleSituationRouter } from "~/lib/battle-situations/router";
import { createTRPCRouter } from "~/lib/trpc/init";

export const appRouter = createTRPCRouter({
  battleSituation: battleSituationRouter,
});

export type AppRouter = typeof appRouter;
