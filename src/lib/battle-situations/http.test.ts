import { describe, expect, it } from "vitest";

import type { AccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";

import { createBattleSituationHttpHandlers } from "./http";
import { BattleSituationError, type BattleSituationService } from "./service";

function createAccessServiceStub(
  overrides: Partial<AccessService> = {},
): AccessService {
  return {
    async getAccess() {
      return {
        ok: true,
        value: {
          user: { id: "user-1", email: "user-1@datavault.local" },
          roles: ["editor"],
        },
      };
    },
    async requireAccess() {
      return {
        user: { id: "user-1", email: "user-1@datavault.local" },
        roles: ["editor"],
      };
    },
    ...overrides,
  };
}

function createBattleSituationServiceStub(
  overrides: Partial<BattleSituationService> = {},
): BattleSituationService {
  return {
    async list() {
      return [];
    },
    async getById(id) {
      return {
        id,
        title: "arena",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
        createdById: "user-1",
        updatedById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z"),
        updatedAt: new Date("2026-04-03T00:00:00.000Z"),
      };
    },
    async create() {
      return {
        id: "bs-1",
        title: "arena",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
        createdById: "user-1",
        updatedById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z"),
        updatedAt: new Date("2026-04-03T00:00:00.000Z"),
      };
    },
    async update() {
      return {
        id: "bs-1",
        title: "arena-updated",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
        createdById: "user-1",
        updatedById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z"),
        updatedAt: new Date("2026-04-03T00:00:00.000Z"),
      };
    },
    async remove() {
      return {
        id: "bs-1",
        title: "arena",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
        createdById: "user-1",
        updatedById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z"),
        updatedAt: new Date("2026-04-03T01:00:00.000Z"),
      };
    },
    async exportById() {
      return {
        meta: {
          id: "bs-1",
          schemaVersion: 1,
          exportedAt: "2026-04-03T01:00:00.000Z",
        },
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
      };
    },
    async importPayload() {
      return {
        id: "bs-2",
        title: "imported",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
        createdById: "user-1",
        updatedById: "user-1",
        createdAt: new Date("2026-04-03T00:00:00.000Z"),
        updatedAt: new Date("2026-04-03T00:00:00.000Z"),
      };
    },
    ...overrides,
  };
}

describe("createBattleSituationHttpHandlers", () => {
  it("returns 201 for create when authorized", async () => {
    const handlers = createBattleSituationHttpHandlers({
      accessService: createAccessServiceStub(),
      battleSituationService: createBattleSituationServiceStub(),
    });

    const request = new Request("http://localhost/api/battle-situations", {
      method: "POST",
      body: JSON.stringify({
        title: "arena",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await handlers.create(request);

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.data.id).toBe("bs-1");
  });

  it("returns 401 when access service raises unauthenticated", async () => {
    const handlers = createBattleSituationHttpHandlers({
      accessService: createAccessServiceStub({
        async requireAccess() {
          throw new AuthzError("UNAUTHENTICATED", "Login required");
        },
      }),
      battleSituationService: createBattleSituationServiceStub(),
    });

    const request = new Request("http://localhost/api/battle-situations", {
      method: "POST",
      body: JSON.stringify({
        title: "arena",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await handlers.create(request);

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when update is forbidden for ownership", async () => {
    const handlers = createBattleSituationHttpHandlers({
      accessService: createAccessServiceStub(),
      battleSituationService: createBattleSituationServiceStub({
        async update() {
          throw new BattleSituationError("FORBIDDEN", "cannot edit");
        },
      }),
    });

    const request = new Request("http://localhost/api/battle-situations/bs-1", {
      method: "PATCH",
      body: JSON.stringify({
        title: "arena-updated",
        sceneJson: { units: [] },
        semanticJson: { allies: [], enemies: [] },
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await handlers.update("bs-1", request);

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("FORBIDDEN");
  });

  it("returns 400 when payload validation fails", async () => {
    const handlers = createBattleSituationHttpHandlers({
      accessService: createAccessServiceStub(),
      battleSituationService: createBattleSituationServiceStub({
        async create() {
          throw new BattleSituationError("INVALID_PAYLOAD", "bad payload", [
            "sceneJson must be an object.",
          ]);
        },
      }),
    });

    const request = new Request("http://localhost/api/battle-situations", {
      method: "POST",
      body: JSON.stringify({
        title: "arena",
        sceneJson: [],
        semanticJson: { allies: [], enemies: [] },
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await handlers.create(request);

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("INVALID_PAYLOAD");
    expect(payload.details).toEqual(["sceneJson must be an object."]);
  });
});
