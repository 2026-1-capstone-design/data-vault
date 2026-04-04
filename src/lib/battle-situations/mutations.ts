import { createMutation } from "react-query-kit";

import { trpc } from "~/lib/trpc/client";
import { getQueryClient } from "~/shared/tanstack-query/client";

import { useBattleSituation, useBattleSituationList } from "./queries";

export const useCreateBattleSimulation = createMutation({
  mutationKey: ["create-battle-simulation"],
  mutationFn: (
    variables: Parameters<typeof trpc.battleSituation.create.mutate>[0],
  ) => {
    return trpc.battleSituation.create.mutate(variables);
  },
  onSettled: () => {
    const queryClient = getQueryClient();

    queryClient.invalidateQueries({
      queryKey: useBattleSituationList.getKey(),
    });
  },
});

export const useUpdateBattleSimulation = createMutation({
  mutationKey: ["update-battle-simulation"],
  mutationFn: (
    variables: Parameters<typeof trpc.battleSituation.update.mutate>[0],
  ) => {
    return trpc.battleSituation.update.mutate(variables);
  },
  onSettled: (data) => {
    const queryClient = getQueryClient();

    queryClient.invalidateQueries({
      queryKey: useBattleSituationList.getKey(),
    });
    if (data?.id != null) {
      queryClient.invalidateQueries({
        queryKey: useBattleSituation.getKey({ id: data.id }),
      });
    }
  },
});

export const useDeleteBattleSimulation = createMutation({
  mutationKey: ["delete-battle-simulation"],
  mutationFn: (
    variables: Parameters<typeof trpc.battleSituation.delete.mutate>[0],
  ) => {
    return trpc.battleSituation.delete.mutate(variables);
  },
  onSettled: (data) => {
    const queryClient = getQueryClient();

    queryClient.invalidateQueries({
      queryKey: useBattleSituationList.getKey(),
    });
    if (data?.id != null) {
      queryClient.invalidateQueries({
        queryKey: useBattleSituation.getKey({ id: data.id }),
      });
    }
  },
});
