import { describe, expect, it } from "vitest";

import { createAccessService } from "./access-service";
import { AuthzError } from "./guards";

describe("createAccessService", () => {
  it("returns allowed user context when role is permitted", async () => {
    const service = createAccessService({
      getCurrentUser: async () => ({
        id: "user-1",
        email: "editor@datavault.app",
      }),
      loadRoles: async () => ["editor"],
    });

    const result = await service.getAccess(["admin", "editor"]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.user.id).toBe("user-1");
      expect(result.value.roles).toEqual(["editor"]);
    }
  });

  it("returns UNAUTHENTICATED error when no user exists", async () => {
    const service = createAccessService({
      getCurrentUser: async () => null,
      loadRoles: async () => ["editor"],
    });

    const result = await service.getAccess(["editor"]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthzError);
      expect((result.error as AuthzError).code).toBe("UNAUTHENTICATED");
    }
  });

  it("returns FORBIDDEN error when role is not permitted", async () => {
    const service = createAccessService({
      getCurrentUser: async () => ({ id: "user-1" }),
      loadRoles: async () => [],
    });

    const result = await service.getAccess(["editor"]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthzError);
      expect((result.error as AuthzError).code).toBe("FORBIDDEN");
    }
  });

  it("requireAccess throws on authorization failure", async () => {
    const service = createAccessService({
      getCurrentUser: async () => ({ id: "user-1" }),
      loadRoles: async () => [],
    });

    await expect(service.requireAccess(["admin"])).rejects.toThrowError(
      "The current role cannot access this.",
    );
  });
});
