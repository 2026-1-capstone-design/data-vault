import type { RoleName } from "./guards";

type UserRoleQueryClient = {
  userRole: {
    findMany: (_input: {
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
  findRolesByUserId: (_userId: string) => Promise<RoleName[]>;
};

export function createUserAccessRepository(
  db: UserRoleQueryClient,
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
