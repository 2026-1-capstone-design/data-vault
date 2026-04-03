import type { RoleName } from "~/generated/prisma/client";

export type { RoleName };

export const ROLE_NAMES = [
  "admin",
  "editor",
] as const satisfies readonly RoleName[];

export const ACCESS_POLICIES = {
  platformAccess: ["admin", "editor"],
  approvalAccess: ["admin", "editor"],
} as const satisfies Record<string, readonly RoleName[]>;

export type AccessPolicyName = keyof typeof ACCESS_POLICIES;

export function rolesForPolicy(policy: AccessPolicyName): readonly RoleName[] {
  return ACCESS_POLICIES[policy];
}

export function hasPolicyAccess(
  policy: AccessPolicyName,
  roles: readonly RoleName[],
): boolean {
  const requiredRoles = ACCESS_POLICIES[policy];
  return roles.some((role) => requiredRoles.includes(role));
}
