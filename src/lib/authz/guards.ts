import { hasPolicyAccess, type RoleName } from "./policy";

export type { RoleName };

export type SessionUser = {
  id: string;
  email?: string | null;
};

export type AuthContext = {
  user: SessionUser;
  roles: RoleName[];
};

export type LoadRoles = (_userId: string) => Promise<RoleName[]>;

export class AuthzError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  status: number;

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(code);
    this.code = code;
    this.status = code === "UNAUTHENTICATED" ? 401 : 403;
    this.name = "AuthzError";
    this.cause = message;
  }
}

export function requireAuth(user: SessionUser | null | undefined): SessionUser {
  if (!user) {
    throw new AuthzError("UNAUTHENTICATED", "Login is required.");
  }

  return user;
}

export async function requireRole(
  user: SessionUser | null | undefined,
  allowed: readonly RoleName[],
  loadRoles: LoadRoles,
): Promise<AuthContext> {
  const authenticatedUser = requireAuth(user);
  const roles = await loadRoles(authenticatedUser.id);
  const isAllowed = roles.some((role) => allowed.includes(role));

  if (!isAllowed) {
    throw new AuthzError("FORBIDDEN", "The current role cannot access this.");
  }

  return {
    user: authenticatedUser,
    roles,
  };
}

export function canApprove(roles: RoleName[]): boolean {
  return hasPolicyAccess("approvalAccess", roles);
}
