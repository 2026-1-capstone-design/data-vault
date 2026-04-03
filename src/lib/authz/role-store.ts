import { prisma } from "~/lib/prisma";

import type { RoleName } from "./guards";

export async function loadUserRoles(userId: string): Promise<RoleName[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return rows.map((row) => row.role.name as RoleName);
}
