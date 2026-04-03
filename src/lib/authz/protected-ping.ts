import type { AccessService } from "./access-service";
import { AuthzError } from "./guards";
import { rolesForPolicy } from "./policy";

export async function createProtectedPingResponse(
  accessService: AccessService,
): Promise<Response> {
  const result = await accessService.getAccess(
    rolesForPolicy("platformAccess"),
  );

  if (result.ok) {
    return Response.json({
      ok: true,
      userId: result.value.user.id,
      roles: result.value.roles,
    });
  }

  if (result.error instanceof AuthzError) {
    return Response.json(
      {
        ok: false,
        error: result.error.code,
      },
      {
        status: result.error.status,
      },
    );
  }

  throw result.error;
}
