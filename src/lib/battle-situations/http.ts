import type { AccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";
import { rolesForPolicy } from "~/lib/authz/policy";

import { BattleSituationError, type BattleSituationService } from "./service";

type CreateBattleSituationHttpHandlersDeps = {
  accessService: AccessService;
  battleSituationService: BattleSituationService;
};

export function createBattleSituationHttpHandlers(
  deps: CreateBattleSituationHttpHandlersDeps,
) {
  return {
    async list() {
      try {
        await deps.accessService.requireAccess(
          rolesForPolicy("platformAccess"),
        );
        const rows = await deps.battleSituationService.list();
        return Response.json({ ok: true, data: rows });
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
