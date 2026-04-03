import { describe, expect, it } from "vitest";

import type { AuthContext } from "~/lib/authz/guards";

import {
  BattleSituationError,
  createBattleSituationService,
  type BattleSituationRecord,
  type BattleSituationRepository,
} from "./service";

function makeAuthContext(
  userId: string,
  roles: AuthContext["roles"],
): AuthContext {
  return {
    user: { id: userId, email: `${userId}@data-vault.local` },
    roles,
  };
}

function createInMemoryRepository(
  seed: BattleSituationRecord[] = [],
): BattleSituationRepository {
  const items = [...seed];

  return {
    async listActive() {
      return items;
    },
    async findById(id) {
      return items.find((item) => item.id === id) ?? null;
    },
    async create(input) {
      const row: BattleSituationRecord = {
        id: `bs-${items.length + 1}`,
        title: input.title ?? null,
        sceneJson: input.sceneJson,
        semanticJson: input.semanticJson,
        createdById: input.createdById,
        updatedById: input.updatedById,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      items.push(row);
      return row;
    },
    async update(input) {
      const current = items.find((item) => item.id === input.id);

      if (!current) {
        throw new BattleSituationError("NOT_FOUND", "not found");
      }

      const updated: BattleSituationRecord = {
        ...current,
        title: input.title ?? null,
        sceneJson: input.sceneJson,
        semanticJson: input.semanticJson,
        updatedById: input.updatedById,
        updatedAt: new Date(),
      };
      const index = items.findIndex((item) => item.id === input.id);
      items[index] = updated;

      return updated;
    },
    async deleteById(input) {
      const current = items.find((item) => item.id === input.id);

      if (!current) {
        throw new BattleSituationError("NOT_FOUND", "not found");
      }
      const index = items.findIndex((item) => item.id === input.id);
      items.splice(index, 1);

      return current;
    },
  };
}

describe("createBattleSituationService", () => {
  it("creates a battle situation with scene_json and semantic_json", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository(),
    });

    const result = await service.create(makeAuthContext("user-1", ["editor"]), {
      sceneJson: { units: [{ id: "a-1" }] },
      semanticJson: { allies: [{ id: "a-1" }], enemies: [] },
      title: "Arena alpha",
    });

    expect(result.id).toBeTypeOf("string");
    expect(result.sceneJson).toEqual({ units: [{ id: "a-1" }] });
    expect(result.semanticJson).toEqual({
      allies: [{ id: "a-1" }],
      enemies: [],
    });
    expect(result.createdById).toBe("user-1");
    expect(result.updatedById).toBe("user-1");
  });

  it("allows editor to update own battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "before",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "user-1",
          updatedById: "user-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    const updated = await service.update(
      makeAuthContext("user-1", ["editor"]),
      "bs-1",
      {
        title: "after",
        sceneJson: { units: [{ id: "u-1" }, { id: "u-2" }] },
        semanticJson: { allies: [{ id: "u-1" }], enemies: [{ id: "u-2" }] },
      },
    );

    expect(updated.title).toBe("after");
    expect(updated.updatedById).toBe("user-1");
    expect(updated.sceneJson).toEqual({
      units: [{ id: "u-1" }, { id: "u-2" }],
    });
  });

  it("rejects editor update on another user's battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "before",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    await expect(() =>
      service.update(makeAuthContext("user-2", ["editor"]), "bs-1", {
        title: "after",
        sceneJson: { units: [{ id: "u-1" }, { id: "u-2" }] },
        semanticJson: { allies: [{ id: "u-1" }], enemies: [{ id: "u-2" }] },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("allows admin to update another user's battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "before",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    const updated = await service.update(
      makeAuthContext("admin-1", ["admin"]),
      "bs-1",
      {
        title: "admin-updated",
        sceneJson: { units: [{ id: "u-9" }] },
        semanticJson: { allies: [{ id: "u-9" }], enemies: [] },
      },
    );

    expect(updated.title).toBe("admin-updated");
    expect(updated.updatedById).toBe("admin-1");
  });

  it("allows editor to delete own battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "before",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "user-1",
          updatedById: "user-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    const deleted = await service.remove(
      makeAuthContext("user-1", ["editor"]),
      "bs-1",
    );

    expect(deleted.id).toBe("bs-1");
    expect(deleted.createdById).toBe("user-1");
  });

  it("rejects editor delete on another user's battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "before",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    await expect(() =>
      service.remove(makeAuthContext("user-2", ["editor"]), "bs-1"),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("exports battle situation json with meta", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        {
          id: "bs-1",
          title: "arena-export",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [{ id: "u-1" }], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
          createdAt: new Date("2026-04-03T00:00:00.000Z"),
          updatedAt: new Date("2026-04-03T00:00:00.000Z"),
        },
      ]),
    });

    const exported = await service.exportById("bs-1");

    expect(exported.meta.id).toBe("bs-1");
    expect(exported.meta.schemaVersion).toBe(1);
    expect(exported.sceneJson).toEqual({ units: [{ id: "u-1" }] });
    expect(exported.semanticJson).toEqual({
      allies: [{ id: "u-1" }],
      enemies: [],
    });
  });

  it("imports battle situation json as a new record", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository(),
    });

    const imported = await service.importPayload(
      makeAuthContext("user-1", ["editor"]),
      {
        sceneJson: { units: [{ id: "u-1" }] },
        semanticJson: { allies: [{ id: "u-1" }], enemies: [] },
        title: "imported arena",
      },
    );

    expect(imported.id).toBeTypeOf("string");
    expect(imported.title).toBe("imported arena");
    expect(imported.createdById).toBe("user-1");
  });

  it("rejects invalid payload when scene_json is not an object", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository(),
    });

    await expect(() =>
      service.create(makeAuthContext("user-1", ["editor"]), {
        title: "invalid payload",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sceneJson: [] as any,
        semanticJson: { allies: [], enemies: [] },
      }),
    ).rejects.toMatchObject({
      code: "INVALID_PAYLOAD",
      status: 400,
    });
  });
});
