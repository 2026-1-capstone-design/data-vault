import type { Prisma, PrismaClient } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";

import type {
  BattleSituationRecord,
  BattleSituationRepository,
} from "./service";

type BattleSituationQueryClient = Pick<PrismaClient, "battleSituation">;

export function createBattleSituationRepository(
  db: BattleSituationQueryClient = prisma,
): BattleSituationRepository {
  return {
    async listActive() {
      const rows = await db.battleSituation.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      });

      return rows.map(toRecord);
    },
    async findById(id) {
      const row = await db.battleSituation.findUnique({
        where: { id },
      });
      return row ? toRecord(row) : null;
    },
    async create(input) {
      const row = await db.battleSituation.create({
        data: {
          title: input.title ?? null,
          sceneJson: input.sceneJson as Prisma.InputJsonValue,
          semanticJson: input.semanticJson as Prisma.InputJsonValue,
          createdById: input.createdById,
          updatedById: input.updatedById,
        },
      });
      return toRecord(row);
    },
    async update(input) {
      const row = await db.battleSituation.update({
        where: { id: input.id },
        data: {
          title: input.title ?? null,
          sceneJson: input.sceneJson as Prisma.InputJsonValue,
          semanticJson: input.semanticJson as Prisma.InputJsonValue,
          updatedById: input.updatedById,
        },
      });
      return toRecord(row);
    },
    async deleteById(input) {
      const row = await db.battleSituation.delete({
        where: { id: input.id },
      });
      return toRecord(row);
    },
  };
}

function toRecord(
  row: Prisma.BattleSituationGetPayload<object>,
): BattleSituationRecord {
  return {
    id: row.id,
    title: row.title,
    sceneJson: row.sceneJson as Record<string, unknown>,
    semanticJson: row.semanticJson as Record<string, unknown>,
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
