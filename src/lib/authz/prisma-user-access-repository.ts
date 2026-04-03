import { prisma } from "~/lib/prisma";

import { createUserAccessRepository } from "./user-access-repository";

export function createPrismaUserAccessRepository() {
  return createUserAccessRepository(prisma);
}
