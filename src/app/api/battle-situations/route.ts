import { createServerBattleSituationHttpHandlers } from "~/lib/battle-situations/server";

export async function GET() {
  const handlers = await createServerBattleSituationHttpHandlers();
  return handlers.list();
}

export async function POST(request: Request) {
  const handlers = await createServerBattleSituationHttpHandlers();
  return handlers.create(request);
}
