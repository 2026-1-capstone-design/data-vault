import { createServerBattleSituationHttpHandlers } from "~/lib/battle-situations/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const handlers = await createServerBattleSituationHttpHandlers();

  return handlers.exportById(id);
}
