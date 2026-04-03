import { createSupabaseServerClient } from "~/lib/supabase/server";

import { createAccessService, type AccessService } from "./access-service";
import { createPrismaUserAccessRepository } from "./prisma-user-access-repository";

export async function createServerAccessService(): Promise<AccessService> {
  const supabase = await createSupabaseServerClient();
  const userAccessRepo = createPrismaUserAccessRepository();

  return createAccessService({
    getCurrentUser: async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email,
      };
    },
    loadRoles: (userId) => userAccessRepo.findRolesByUserId(userId),
  });
}
