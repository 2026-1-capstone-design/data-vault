import { z } from "zod";

import type { AccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";
import { rolesForPolicy } from "~/lib/authz/policy";

import {
  BattleSituationError,
  type BattleSituationListQuery,
  type BattleSituationListSort,
  type BattleSituationService,
} from "./service";

type CreateBattleSituationHttpHandlersDeps = {
  accessService: AccessService;
  battleSituationService: BattleSituationService;
};

const SORT_VALUES: readonly BattleSituationListSort[] = [
  "updatedAt",
  "description",
  "allyCount",
  "enemyCount",
  "totalCount",
];

const SortSchema = z.enum(SORT_VALUES);
const SortOrderSchema = z.enum(["asc", "desc"]);

export function createBattleSituationHttpHandlers(
  deps: CreateBattleSituationHttpHandlersDeps,
) {
  return {
    async list(request: Request) {
      try {
        await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );

        const query = parseListQuery(request);
        const listed = await deps.battleSituationService.list(query);

        return Response.json({
          ok: true,
          data: listed.rows,
          meta: {
            page: query.page,
            pageSize: query.pageSize,
            total: listed.total,
            totalPages: Math.max(1, Math.ceil(listed.total / query.pageSize)),
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
          },
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async getById(id: string) {
      try {
        await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const row = await deps.battleSituationService.getById(id);
        return Response.json({ ok: true, data: row });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async create(request: Request) {
      try {
        const ctx = await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const body = await request.json();
        const row = await deps.battleSituationService.create(ctx, body);

        return Response.json(
          {
            ok: true,
            data: row,
          },
          {
            status: 201,
          },
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async update(id: string, request: Request) {
      try {
        const ctx = await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const body = await request.json();
        const row = await deps.battleSituationService.update(ctx, id, body);

        return Response.json({
          ok: true,
          data: row,
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async remove(id: string) {
      try {
        const ctx = await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const row = await deps.battleSituationService.remove(ctx, id);

        return Response.json({
          ok: true,
          data: row,
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async exportById(id: string) {
      try {
        await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const payload = await deps.battleSituationService.exportById(id);

        return Response.json({
          ok: true,
          data: payload,
        });
      } catch (error) {
        return toErrorResponse(error);
      }
    },
    async importPayload(request: Request) {
      try {
        const ctx = await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const body = await request.json();
        const row = await deps.battleSituationService.importPayload(ctx, body);

        return Response.json(
          {
            ok: true,
            data: row,
          },
          {
            status: 201,
          },
        );
      } catch (error) {
        return toErrorResponse(error);
      }
    },
  };
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof AuthzError) {
    return Response.json(
      {
        ok: false,
        error: error.code,
      },
      {
        status: error.status,
      },
    );
  }

  if (error instanceof BattleSituationError) {
    return Response.json(
      {
        ok: false,
        error: error.code,
        details: error.details,
      },
      {
        status: error.status,
      },
    );
  }

  throw error;
}

function parseListQuery(request: Request): BattleSituationListQuery {
  const { searchParams } = new URL(request.url);

  const page = parseNumber(searchParams.get("page"), 1);
  const pageSize = parseNumber(searchParams.get("pageSize"), 20);
  const sortBy = parseSort(searchParams.get("sort"));
  const sortOrder = parseSortOrder(searchParams.get("order"));

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
  };
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseSort(value: string | null): BattleSituationListSort {
  const parsed = SortSchema.safeParse(value);
  return parsed.success ? parsed.data : "updatedAt";
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  const parsed = SortOrderSchema.safeParse(value);
  return parsed.success ? parsed.data : "desc";
}
