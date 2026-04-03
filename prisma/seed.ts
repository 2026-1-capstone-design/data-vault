import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, RoleName } from "~/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.admin },
    update: {},
    create: { name: RoleName.admin },
  });

  await prisma.role.upsert({
    where: { name: RoleName.editor },
    update: {},
    create: { name: RoleName.editor },
  });

  const defaultAdminUserId = process.env.DEFAULT_ADMIN_USER_ID;

  if (!defaultAdminUserId) {
    console.warn(
      "DEFAULT_ADMIN_USER_ID is missing. Role seeds were created without admin mapping.",
    );
    return;
  }

  await prisma.userProfile.upsert({
    where: { id: defaultAdminUserId },
    update: {},
    create: {
      id: defaultAdminUserId,
      email: process.env.DEFAULT_ADMIN_EMAIL ?? null,
    },
  });

  await prisma.userRole.upsert({
    where: {
      // Prisma compound unique input name
      // eslint-disable-next-line camelcase
      userId_roleId: {
        userId: defaultAdminUserId,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: defaultAdminUserId,
      roleId: adminRole.id,
    },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
