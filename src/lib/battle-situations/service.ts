import { z } from "zod";

import type { AuthContext } from "~/lib/authz/guards";

type JsonObject = Record<string, unknown>;

type TeamCount = {
  allyCount: number;
  enemyCount: number;
  totalCount: number;
};

export type BattleSituationRecord = {
  id: string;
  title: string | null;
  description: string;
  sceneJson: JsonObject;
  semanticJson: JsonObject;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  createdById: string;
  updatedById: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BattleSituationListSort =
  | "updatedAt"
  | "description"
  | "allyCount"
  | "enemyCount"
  | "totalCount";

export type BattleSituationListQuery = {
  page: number;
  pageSize: number;
  sortBy: BattleSituationListSort;
  sortOrder: "asc" | "desc";
};

type CreateBattleSituationInput = {
  title: string | null;
  description: string;
  sceneJson: JsonObject;
  semanticJson: JsonObject;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  createdById: string;
  updatedById: string;
};

type UpdateBattleSituationInput = {
  id: string;
  title: string | null;
  description: string;
  sceneJson: JsonObject;
  semanticJson: JsonObject;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  updatedById: string;
};

type DeleteBattleSituationInput = {
  id: string;
};

export type BattleSituationRepository = {
  listPage: (
    query: BattleSituationListQuery,
  ) => Promise<{ rows: BattleSituationRecord[]; total: number }>;
  findById: (id: string) => Promise<BattleSituationRecord | null>;
  create: (input: CreateBattleSituationInput) => Promise<BattleSituationRecord>;
  update: (input: UpdateBattleSituationInput) => Promise<BattleSituationRecord>;
  deleteById: (
    input: DeleteBattleSituationInput,
  ) => Promise<BattleSituationRecord>;
};

export class BattleSituationError extends Error {
  code: "FORBIDDEN" | "NOT_FOUND" | "INVALID_PAYLOAD";
  status: number;
  details?: string[];

  constructor(
    code: "FORBIDDEN" | "NOT_FOUND" | "INVALID_PAYLOAD",
    message: string,
    details?: string[],
  ) {
    super(message);
    this.code = code;
    this.status =
      code === "INVALID_PAYLOAD" ? 400 : code === "NOT_FOUND" ? 404 : 403;
    this.name = "BattleSituationError";
    this.details = details;
  }
}

type CreateBattleSituationPayload = {
  title?: string | null;
  description?: string;
  sceneJson: JsonObject;
  semanticJson: JsonObject;
};

const JsonObjectSchema = z.custom<JsonObject>(
  (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value),
  {
    message: "must be an object.",
  },
);

const CreateBattleSituationPayloadSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().optional(),
  sceneJson: JsonObjectSchema,
  semanticJson: JsonObjectSchema,
});

type CreateBattleSituationServiceDeps = {
  repository: BattleSituationRepository;
};

export type BattleSituationService = {
  list: (
    query: BattleSituationListQuery,
  ) => Promise<{ rows: BattleSituationRecord[]; total: number }>;
  getById: (id: string) => Promise<BattleSituationRecord>;
  create: (
    auth: AuthContext,
    payload: CreateBattleSituationPayload,
  ) => Promise<BattleSituationRecord>;
  update: (
    auth: AuthContext,
    id: string,
    payload: CreateBattleSituationPayload,
  ) => Promise<BattleSituationRecord>;
  remove: (auth: AuthContext, id: string) => Promise<BattleSituationRecord>;
  exportById: (id: string) => Promise<{
    meta: {
      id: string;
      schemaVersion: number;
      exportedAt: string;
    };
    sceneJson: JsonObject;
    semanticJson: JsonObject;
  }>;
  importPayload: (
    auth: AuthContext,
    payload: CreateBattleSituationPayload,
  ) => Promise<BattleSituationRecord>;
};

export function createBattleSituationService(
  deps: CreateBattleSituationServiceDeps,
): BattleSituationService {
  return {
    async list(query) {
      return deps.repository.listPage(query);
    },
    async getById(id) {
      const current = await deps.repository.findById(id);

      if (!current) {
        throw new BattleSituationError(
          "NOT_FOUND",
          "Battle situation was not found.",
        );
      }

      return current;
    },
    async create(auth, payload) {
      validatePayload(payload);
      const counts = deriveTeamCounts(payload.sceneJson);

      return deps.repository.create({
        title: payload.title ?? null,
        description: payload.description?.trim() ?? "",
        sceneJson: payload.sceneJson,
        semanticJson: payload.semanticJson,
        ...counts,
        createdById: auth.user.id,
        updatedById: auth.user.id,
      });
    },
    async update(auth, id, payload) {
      validatePayload(payload);
      const counts = deriveTeamCounts(payload.sceneJson);

      const current = await deps.repository.findById(id);

      if (!current) {
        throw new BattleSituationError(
          "NOT_FOUND",
          "Battle situation was not found.",
        );
      }

      if (!canMutate(auth, current.createdById)) {
        throw new BattleSituationError(
          "FORBIDDEN",
          "You cannot edit this battle situation.",
        );
      }

      return deps.repository.update({
        id,
        title: payload.title ?? null,
        description: payload.description?.trim() ?? "",
        sceneJson: payload.sceneJson,
        semanticJson: payload.semanticJson,
        ...counts,
        updatedById: auth.user.id,
      });
    },
    async remove(auth, id) {
      const current = await deps.repository.findById(id);

      if (!current) {
        throw new BattleSituationError(
          "NOT_FOUND",
          "Battle situation was not found.",
        );
      }

      if (!canMutate(auth, current.createdById)) {
        throw new BattleSituationError(
          "FORBIDDEN",
          "You cannot delete this battle situation.",
        );
      }

      return deps.repository.deleteById({
        id,
      });
    },
    async exportById(id) {
      const current = await deps.repository.findById(id);

      if (!current) {
        throw new BattleSituationError(
          "NOT_FOUND",
          "Battle situation was not found.",
        );
      }

      return {
        meta: {
          id: current.id,
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
        },
        sceneJson: current.sceneJson,
        semanticJson: current.semanticJson,
      };
    },
    async importPayload(auth, payload) {
      validatePayload(payload);
      const counts = deriveTeamCounts(payload.sceneJson);

      return deps.repository.create({
        title: payload.title ?? null,
        description: payload.description?.trim() ?? "",
        sceneJson: payload.sceneJson,
        semanticJson: payload.semanticJson,
        ...counts,
        createdById: auth.user.id,
        updatedById: auth.user.id,
      });
    },
  };
}

function validatePayload(payload: CreateBattleSituationPayload): void {
  const parsed = CreateBattleSituationPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => {
      const key =
        issue.path.length > 0 && typeof issue.path[0] === "string"
          ? issue.path[0]
          : "payload";
      return `${key} ${issue.message}`;
    });

    throw new BattleSituationError(
      "INVALID_PAYLOAD",
      "Payload validation failed.",
      errors,
    );
  }
}

function canMutate(auth: AuthContext, ownerId: string): boolean {
  if (auth.roles.includes("admin")) {
    return true;
  }

  if (auth.roles.includes("editor") && auth.user.id === ownerId) {
    return true;
  }

  return false;
}

function deriveTeamCounts(sceneJson: JsonObject): TeamCount {
  const units = sceneJson.units;
  if (!Array.isArray(units)) {
    return {
      allyCount: 0,
      enemyCount: 0,
      totalCount: 0,
    };
  }

  const teamIds = units
    .map((unit) => {
      if (typeof unit !== "object" || unit === null) {
        return null;
      }

      const teamId = (unit as { teamId?: unknown }).teamId;
      return typeof teamId === "string" ? teamId : null;
    })
    .filter((teamId): teamId is string => teamId !== null);

  const allyCount = teamIds.filter((teamId) => teamId === "ally").length;
  const enemyCount = teamIds.filter((teamId) => teamId === "enemy").length;

  return {
    allyCount,
    enemyCount,
    totalCount: allyCount + enemyCount,
  };
}
