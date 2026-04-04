import * as z from "zod";

import { type Prisma } from "~/generated/prisma/client";
import { baseProcedure, createTRPCRouter } from "~/lib/trpc/init";
import { prisma } from "~/shared/prisma";
import { getPaginationMeta, type Pagination } from "~/shared/query";
import { jsonObjectSchema } from "~/shared/types";

import { toSemantic } from "./transform";
import { sceneSchema } from "./types";

export const battleSituationInputSchema = z.object({
  title: z.string().nullish(),
  description: z.string(),
  sceneJson: jsonObjectSchema,
  semanticJson: jsonObjectSchema,
  allyCount: z.number(),
  enemyCount: z.number(),
  totalCount: z.number(),
});

export const battleSituationRouter = createTRPCRouter({
  get: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      return prisma.battleSituation
        .findUnique({
          where: { id },
        })
        .then((res) => {
          const scene = sceneSchema.parse(res?.sceneJson);
          const semantic = toSemantic(scene);

          return {
            ...res,
            sceneJson: scene,
            semanticJson: semantic,
          };
        });
    }),
  getList: baseProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }),
    )
    .query(
      async ({
        input,
      }): Promise<Pagination<Prisma.BattleSituationGetPayload<null>>> => {
        const { limit, offset } = input;

        const [count, battleSituations] = await Promise.all([
          prisma.battleSituation.count(),
          prisma.battleSituation
            .findMany({
              take: limit,
              skip: offset,
            })
            .then((items) =>
              items.map((item) => {
                const scene = sceneSchema.parse(item.sceneJson);
                const semantic = toSemantic(scene);

                return {
                  ...item,
                  sceneJson: scene,
                  semanticJson: semantic,
                };
              }),
            ),
        ]);

        return {
          items: battleSituations,
          meta: getPaginationMeta({
            totalCount: count,
            limit,
            offset,
          }),
        };
      },
    ),
  create: baseProcedure
    .input(battleSituationInputSchema)
    .mutation(async ({ input, ctx }) => {
      return prisma.battleSituation.create({
        data: {
          title: input.title,
          description: input.description,
          sceneJson: input.sceneJson,
          semanticJson: input.semanticJson,
          allyCount: input.allyCount,
          enemyCount: input.enemyCount,
          totalCount: input.totalCount,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
        },
      });
    }),
  update: baseProcedure
    .input(
      battleSituationInputSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return prisma.battleSituation.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          sceneJson: input.sceneJson,
          semanticJson: input.semanticJson,
          allyCount: input.allyCount,
          enemyCount: input.enemyCount,
          totalCount: input.totalCount,
          updatedById: ctx.user.id,
        },
      });
    }),
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.battleSituation.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
