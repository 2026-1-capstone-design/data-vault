import { createProtectedPingResponse } from "~/lib/authz/protected-ping";
import { createServerAccessService } from "~/lib/authz/server-access-service";

export async function GET() {
  const accessService = await createServerAccessService();

  return createProtectedPingResponse(accessService);
}
