import {
  requireRole,
  type AuthContext,
  type LoadRoles,
  type RoleName,
  type SessionUser,
} from "./guards";

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
  getAccess: (_allowed: RoleName[]) => Promise<AccessResult>;
  requireAccess: (_allowed: RoleName[]) => Promise<AuthContext>;
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
