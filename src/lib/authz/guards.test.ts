import { describe, expect, it } from "vitest";

import {
  AuthzError,
  canApprove,
  requireAuth,
  requireRole,
  type RoleName,
} from "./guards";

describe("requireAuth", () => {
  it("throws UNAUTHENTICATED when no user exists", () => {
    expect(() => requireAuth(null)).toThrowError(AuthzError);
    expect(() => requireAuth(null)).toThrowError("UNAUTHENTICATED");
  });

  it("returns user identity when session is present", () => {
    const user = requireAuth({
      id: "user-1",
      email: "editor@datavault.app",
    });

    expect(user.id).toBe("user-1");
    expect(user.email).toBe("editor@datavault.app");
  });
});

describe("requireRole", () => {
  it("throws FORBIDDEN when user role is not allowed", async () => {
    const loadRoles = () => Promise.resolve(["editor"] as RoleName[]);

    await expect(
      requireRole(
        { id: "user-1", email: "editor@datavault.app" },
        ["admin"],
        loadRoles,
      ),
    ).rejects.toThrowError("FORBIDDEN");
  });

  it("returns context for allowed role", async () => {
    const loadRoles = () => Promise.resolve(["editor"] as RoleName[]);

    const ctx = await requireRole(
      { id: "user-1", email: "editor@datavault.app" },
      ["admin", "editor"],
      loadRoles,
    );

    expect(ctx.user.id).toBe("user-1");
    expect(ctx.roles).toEqual(["editor"]);
  });
});

describe("canApprove", () => {
  it("returns true for admin or editor role", () => {
    expect(canApprove(["admin"])).toBe(true);
    expect(canApprove(["editor"])).toBe(true);
  });

  it("returns false when no approval role exists", () => {
    expect(canApprove([])).toBe(false);
  });
});
