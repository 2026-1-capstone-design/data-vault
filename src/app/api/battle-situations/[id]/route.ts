import { createServerBattleSituationHttpHandlers } from "~/lib/battle-situations/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const handlers = await createServerBattleSituationHttpHandlers();

  return handlers.getById(id);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const handlers = await createServerBattleSituationHttpHandlers();

  return handlers.update(id, request);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const handlers = await createServerBattleSituationHttpHandlers();

  return handlers.remove(id);
}
