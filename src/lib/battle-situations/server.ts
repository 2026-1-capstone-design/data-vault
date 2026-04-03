import { createServerAccessService } from "~/lib/authz/access-service";

import { createBattleSituationHttpHandlers } from "./http";
import { createBattleSituationRepository } from "./repository";
import { createBattleSituationService } from "./service";

export async function createServerBattleSituationHttpHandlers() {
  const accessService = await createServerAccessService();
  const repository = createBattleSituationRepository();
  const battleSituationService = createBattleSituationService({
    repository,
  });

  return createBattleSituationHttpHandlers({
    accessService,
    battleSituationService,
  });
}
