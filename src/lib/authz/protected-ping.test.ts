import { describe, expect, it } from "vitest";

import { AuthzError } from "./guards";
import { createProtectedPingResponse } from "./protected-ping";

describe("createProtectedPingResponse", () => {
  it("returns 200 with user context for allowed role", async () => {
    const response = await createProtectedPingResponse({
      getCurrentUser: async () => ({ id: "user-1", email: "e@datavault.app" }),
      loadRoles: async () => ["editor"],
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.userId).toBe("user-1");
    expect(payload.roles).toEqual(["editor"]);
  });

  it("returns 401 when user is unauthenticated", async () => {
    const response = await createProtectedPingResponse({
      getCurrentUser: async () => null,
      loadRoles: async () => ["editor"],
    });

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when user has no allowed role", async () => {
    const response = await createProtectedPingResponse({
      getCurrentUser: async () => ({ id: "user-1" }),
      loadRoles: async () => [],
    });

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe("FORBIDDEN");
  });

  it("rethrows non-authz errors", async () => {
    await expect(() =>
      createProtectedPingResponse({
        getCurrentUser: async () => ({ id: "user-1" }),
        loadRoles: async () => {
          throw new Error("db offline");
        },
      }),
    ).rejects.toThrowError("db offline");
  });

  it("preserves AuthzError status code", async () => {
    const response = await createProtectedPingResponse({
      getCurrentUser: async () => ({ id: "user-1" }),
      loadRoles: async () => {
        throw new AuthzError("FORBIDDEN", "denied");
      },
    });

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe("FORBIDDEN");
  });
});
