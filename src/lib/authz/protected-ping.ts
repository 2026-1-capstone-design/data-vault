import {
  AuthzError,
  requireRole,
  type LoadRoles,
  type SessionUser,
} from "./guards";

type ProtectedPingDeps = {
  getCurrentUser: () => Promise<SessionUser | null>;
  loadRoles: LoadRoles;
};

export async function createProtectedPingResponse(
  deps: ProtectedPingDeps,
): Promise<Response> {
  try {
    const user = await deps.getCurrentUser();
    const ctx = await requireRole(user, ["admin", "editor"], deps.loadRoles);

    return Response.json({
      ok: true,
      userId: ctx.user.id,
      roles: ctx.roles,
    });
  } catch (error) {
    if (error instanceof AuthzError) {
      return Response.json(
        {
          ok: false,
          error: error.code,
        },
        {
          status: error.status,
        },
      );
    }

    throw error;
  }
}
