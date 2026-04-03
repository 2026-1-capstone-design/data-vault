import { describe, expect, it } from "vitest";

import type { AuthContext } from "~/lib/authz/guards";

import {
  BattleSituationError,
  createBattleSituationService,
  type BattleSituationListQuery,
  type BattleSituationListSort,
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

const SAMPLE_CREATED_AT = new Date("2026-04-03T00:00:00.000Z");
const SAMPLE_UPDATED_AT = new Date("2026-04-03T01:00:00.000Z");

function createRecord(
  seed: Partial<BattleSituationRecord>,
): BattleSituationRecord {
  return {
    id: seed.id ?? "bs-1",
    title: seed.title ?? "arena",
    description: seed.description ?? "description",
    sceneJson: seed.sceneJson ?? { units: [] },
    semanticJson: seed.semanticJson ?? { allies: [], enemies: [] },
    allyCount: seed.allyCount ?? 0,
    enemyCount: seed.enemyCount ?? 0,
    totalCount: seed.totalCount ?? 0,
    createdById: seed.createdById ?? "user-1",
    updatedById: seed.updatedById ?? "user-1",
    createdAt: seed.createdAt ?? SAMPLE_CREATED_AT,
    updatedAt: seed.updatedAt ?? SAMPLE_UPDATED_AT,
  };
}

function createInMemoryRepository(
  seed: BattleSituationRecord[] = [],
): BattleSituationRepository {
  const items = [...seed];

  return {
    async listPage(query) {
      const sorted = [...items].sort((left, right) => {
        const [leftValue, rightValue] = getSortableValues(
          left,
          right,
          query.sortBy,
        );

        if (leftValue < rightValue) {
          return query.sortOrder === "asc" ? -1 : 1;
        }

        if (leftValue > rightValue) {
          return query.sortOrder === "asc" ? 1 : -1;
        }

        return 0;
      });

      const total = sorted.length;
      const offset = (query.page - 1) * query.pageSize;
      const rows = sorted.slice(offset, offset + query.pageSize);

      return { rows, total };
    },
    async findById(id) {
      return items.find((item) => item.id === id) ?? null;
    },
    async create(input) {
      const row: BattleSituationRecord = {
        id: `bs-${items.length + 1}`,
        title: input.title,
        description: input.description,
        sceneJson: input.sceneJson,
        semanticJson: input.semanticJson,
        allyCount: input.allyCount,
        enemyCount: input.enemyCount,
        totalCount: input.totalCount,
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
        title: input.title,
        description: input.description,
        sceneJson: input.sceneJson,
        semanticJson: input.semanticJson,
        allyCount: input.allyCount,
        enemyCount: input.enemyCount,
        totalCount: input.totalCount,
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

function getSortableValues(
  left: BattleSituationRecord,
  right: BattleSituationRecord,
  sortBy: BattleSituationListSort,
): [number | string | Date, number | string | Date] {
  if (sortBy === "allyCount") {
    return [left.allyCount, right.allyCount];
  }

  if (sortBy === "enemyCount") {
    return [left.enemyCount, right.enemyCount];
  }

  if (sortBy === "totalCount") {
    return [left.totalCount, right.totalCount];
  }

  if (sortBy === "description") {
    return [left.description, right.description];
  }

  return [left.updatedAt, right.updatedAt];
}

describe("createBattleSituationService", () => {
  it("creates a battle situation with description and derived counts", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository(),
    });

    const result = await service.create(makeAuthContext("user-1", ["editor"]), {
      sceneJson: {
        units: [
          { unitId: "a-1", teamId: "ally" },
          { unitId: "a-2", teamId: "ally" },
          { unitId: "e-1", teamId: "enemy" },
          { unitId: "n-1", teamId: "neutral" },
        ],
      },
      semanticJson: { allies: [{ id: "a-1" }], enemies: [] },
      title: "Arena alpha",
      description: "A classic duel",
    });

    expect(result.id).toBeTypeOf("string");
    expect(result.description).toBe("A classic duel");
    expect(result.allyCount).toBe(2);
    expect(result.enemyCount).toBe(1);
    expect(result.totalCount).toBe(3);
  });

  it("returns paged and sorted results", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        createRecord({ id: "bs-1", allyCount: 1, totalCount: 1 }),
        createRecord({ id: "bs-2", allyCount: 5, totalCount: 7 }),
        createRecord({ id: "bs-3", allyCount: 3, totalCount: 4 }),
      ]),
    });

    const query: BattleSituationListQuery = {
      page: 1,
      pageSize: 2,
      sortBy: "allyCount",
      sortOrder: "desc",
    };

    const listed = await service.list(query);

    expect(listed.rows.map((row) => row.id)).toEqual(["bs-2", "bs-3"]);
    expect(listed.total).toBe(3);
  });

  it("allows editor to update own battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        createRecord({
          id: "bs-1",
          title: "before",
          description: "old",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "user-1",
          updatedById: "user-1",
        }),
      ]),
    });

    const updated = await service.update(
      makeAuthContext("user-1", ["editor"]),
      "bs-1",
      {
        title: "after",
        description: "new description",
        sceneJson: {
          units: [
            { unitId: "u-1", teamId: "ally" },
            { unitId: "u-2", teamId: "enemy" },
          ],
        },
        semanticJson: { allies: [{ id: "u-1" }], enemies: [{ id: "u-2" }] },
      },
    );

    expect(updated.title).toBe("after");
    expect(updated.description).toBe("new description");
    expect(updated.updatedById).toBe("user-1");
    expect(updated.totalCount).toBe(2);
  });

  it("rejects editor update on another user's battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        createRecord({
          id: "bs-1",
          title: "before",
          description: "old",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
        }),
      ]),
    });

    await expect(() =>
      service.update(makeAuthContext("user-2", ["editor"]), "bs-1", {
        title: "after",
        description: "after",
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
        createRecord({
          id: "bs-1",
          title: "before",
          description: "old",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
        }),
      ]),
    });

    const updated = await service.update(
      makeAuthContext("admin-1", ["admin"]),
      "bs-1",
      {
        title: "admin-updated",
        description: "admin-updated",
        sceneJson: { units: [{ id: "u-9", teamId: "enemy" }] },
        semanticJson: { allies: [], enemies: [{ id: "u-9" }] },
      },
    );

    expect(updated.title).toBe("admin-updated");
    expect(updated.updatedById).toBe("admin-1");
  });

  it("allows editor to delete own battle situation", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository([
        createRecord({
          id: "bs-1",
          title: "before",
          description: "old",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "user-1",
          updatedById: "user-1",
        }),
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
        createRecord({
          id: "bs-1",
          title: "before",
          description: "old",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [], enemies: [] },
          createdById: "owner-1",
          updatedById: "owner-1",
        }),
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
        createRecord({
          id: "bs-1",
          title: "arena-export",
          description: "for export",
          sceneJson: { units: [{ id: "u-1" }] },
          semanticJson: { allies: [{ id: "u-1" }], enemies: [] },
          allyCount: 1,
          enemyCount: 0,
          totalCount: 1,
          createdById: "owner-1",
          updatedById: "owner-1",
        }),
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
        sceneJson: { units: [{ unitId: "u-1", teamId: "ally" }] },
        semanticJson: { allies: [{ id: "u-1" }], enemies: [] },
        title: "imported arena",
        description: "from file",
      },
    );

    expect(imported.id).toBeTypeOf("string");
    expect(imported.title).toBe("imported arena");
    expect(imported.description).toBe("from file");
    expect(imported.createdById).toBe("user-1");
  });

  it("rejects invalid payload when scene_json is not an object", async () => {
    const service = createBattleSituationService({
      repository: createInMemoryRepository(),
    });

    await expect(() =>
      service.create(makeAuthContext("user-1", ["editor"]), {
        title: "invalid payload",
        description: "invalid",
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
