import { createServerAccessService } from "~/lib/authz/access-service";
import { createProtectedPingResponse } from "~/lib/authz/protected-ping";

export async function GET() {
  const accessService = await createServerAccessService();

  return createProtectedPingResponse(accessService);
}
