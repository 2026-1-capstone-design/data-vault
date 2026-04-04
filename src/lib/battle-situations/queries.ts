import { createInfiniteQuery, createQuery } from "react-query-kit";

import { trpc } from "~/lib/trpc/client";

const QUERY_KEY = "battle-situation";
export const useBattleSituation = createQuery({
  queryKey: [QUERY_KEY],
  fetcher: (variables: { id: string }) => {
    return trpc.battleSituation.get.query({ id: variables.id });
  },
});

export const useBattleSituationList = createInfiniteQuery({
  queryKey: [QUERY_KEY, "list"],
  fetcher: (variables: { limit?: number } | undefined, { pageParam }) => {
    const limit = variables?.limit ?? 20;
    return trpc.battleSituation.getList.query({ limit, offset: pageParam });
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.meta.nextOffset ?? undefined,
});
