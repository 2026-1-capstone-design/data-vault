import { createServerBattleSituationHttpHandlers } from "~/lib/battle-situations/server";

export async function POST(request: Request) {
  const handlers = await createServerBattleSituationHttpHandlers();

  return handlers.importPayload(request);
}
