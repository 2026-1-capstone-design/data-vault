import { prisma } from "~/lib/prisma";

import type { RoleName } from "./guards";

type UserRoleQueryClient = {
  userRole: {
    findMany: (input: {
      where: { userId: string };
      select: {
        role: {
          select: {
            name: true;
          };
        };
      };
    }) => Promise<Array<{ role: { name: RoleName } }>>;
  };
};

export type UserAccessRepository = {
  findRolesByUserId: (userId: string) => Promise<RoleName[]>;
};

export function createUserAccessRepository(
  db: UserRoleQueryClient = prisma,
): UserAccessRepository {
  return {
    async findRolesByUserId(userId) {
      const rows = await db.userRole.findMany({
        where: { userId },
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      return rows.map((row) => row.role.name);
    },
  };
}
