import { supabaseServerClient } from "~/shared/supabase/server";

import {
  requireRole,
  type AuthContext,
  type LoadRoles,
  type RoleName,
  type SessionUser,
} from "./guards";
import { createUserAccessRepository } from "./user-access-repository";

type AccessOk = {
  ok: true;
  value: AuthContext;
};

type AccessFailure = {
  ok: false;
  error: Error;
};

export type AccessResult = AccessOk | AccessFailure;

export type AccessService = {
  getAccess: (allowed: readonly RoleName[]) => Promise<AccessResult>;
  requireAccess: (allowed: readonly RoleName[]) => Promise<AuthContext>;
};

type CreateAccessServiceDeps = {
  getCurrentUser: () => Promise<SessionUser | null>;
  loadRoles: LoadRoles;
};

export function createAccessService(
  deps: CreateAccessServiceDeps,
): AccessService {
  return {
    async getAccess(allowed) {
      try {
        const user = await deps.getCurrentUser();
        const ctx = await requireRole(user, allowed, deps.loadRoles);

        return {
          ok: true,
          value: ctx,
        };
      } catch (error) {
        return {
          ok: false,
          error: error as Error,
        };
      }
    },
    async requireAccess(allowed) {
      const user = await deps.getCurrentUser();
      return requireRole(user, allowed, deps.loadRoles);
    },
  };
}

export async function createServerAccessService(): Promise<AccessService> {
  const userAccessRepo = createUserAccessRepository();

  return createAccessService({
    getCurrentUser: async () => {
      const { data } = await supabaseServerClient.auth.getUser();

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
