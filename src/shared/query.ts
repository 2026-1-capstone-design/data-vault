export type Pagination<T> = {
  items: T[];
  meta: {
    totalCount: number;
    limit: number;
    offset: number;
    nextOffset: number | null;
    hasNext: boolean;
  };
};

export const getPaginationMeta = ({
  totalCount,
  limit,
  offset,
}: {
  totalCount: number;
  limit: number;
  offset: number;
}) => {
  const hasNext = offset + limit < totalCount;
  const nextOffset = hasNext ? offset + limit : null;

  return {
    totalCount,
    limit,
    offset,
    nextOffset,
    hasNext,
  };
};
