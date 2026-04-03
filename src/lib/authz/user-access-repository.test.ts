import { describe, expect, it } from "vitest";

import { createUserAccessRepository } from "./user-access-repository";

describe("createUserAccessRepository", () => {
  it("maps persisted role rows into role name list", async () => {
    const repo = createUserAccessRepository({
      userRole: {
        findMany: async () => [
          { role: { name: "admin" } },
          { role: { name: "editor" } },
        ],
      },
    });

    const roles = await repo.findRolesByUserId("user-1");

    expect(roles).toEqual(["admin", "editor"]);
  });

  it("returns an empty list when no roles exist", async () => {
    const repo = createUserAccessRepository({
      userRole: {
        findMany: async () => [],
      },
    });

    const roles = await repo.findRolesByUserId("user-1");

    expect(roles).toEqual([]);
  });
});
