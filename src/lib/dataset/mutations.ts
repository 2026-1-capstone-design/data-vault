import { createMutation } from "react-query-kit";

import { trpc } from "~/lib/trpc/client";

export const useGenerateDatasetSample = createMutation({
  mutationKey: ["generate-dataset-sample"],
  mutationFn: (
    variables: Parameters<typeof trpc.dataset.generate.mutate>[0],
  ) => {
    return trpc.dataset.generate.mutate(variables);
  },
});
