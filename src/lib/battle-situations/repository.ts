import type { Prisma, PrismaClient } from "~/generated/prisma/client";
import { prisma } from "~/lib/prisma";

import type {
  BattleSituationListSort,
  BattleSituationRecord,
  BattleSituationRepository,
  BattleSituationListQuery,
} from "./service";

type BattleSituationQueryClient = Pick<PrismaClient, "battleSituation">;

const SORT_FIELD_MAP: Record<
  BattleSituationListSort,
  Prisma.BattleSituationScalarFieldEnum
> = {
  updatedAt: "updatedAt",
  description: "description",
  allyCount: "allyCount",
  enemyCount: "enemyCount",
  totalCount: "totalCount",
};

export function createBattleSituationRepository(
  db: BattleSituationQueryClient = prisma,
): BattleSituationRepository {
  return {
    async listPage(query: BattleSituationListQuery) {
      const [rows, total] = await Promise.all([
        db.battleSituation.findMany({
          orderBy: {
            [SORT_FIELD_MAP[query.sortBy]]: query.sortOrder,
          },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        db.battleSituation.count(),
      ]);

      return {
        rows: rows.map(toRecord),
        total,
      };
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
          title: input.title,
          description: input.description,
          sceneJson: input.sceneJson as Prisma.InputJsonValue,
          semanticJson: input.semanticJson as Prisma.InputJsonValue,
          allyCount: input.allyCount,
          enemyCount: input.enemyCount,
          totalCount: input.totalCount,
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
          title: input.title,
          description: input.description,
          sceneJson: input.sceneJson as Prisma.InputJsonValue,
          semanticJson: input.semanticJson as Prisma.InputJsonValue,
          allyCount: input.allyCount,
          enemyCount: input.enemyCount,
          totalCount: input.totalCount,
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
    description: row.description,
    sceneJson: row.sceneJson as Record<string, unknown>,
    semanticJson: row.semanticJson as Record<string, unknown>,
    allyCount: row.allyCount,
    enemyCount: row.enemyCount,
    totalCount: row.totalCount,
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
