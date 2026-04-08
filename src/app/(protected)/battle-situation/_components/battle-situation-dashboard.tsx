"use client";

import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ApiErrorDialog } from "~/components/api-error-dialog";
import { BattleSituationCanvas } from "~/components/battle-situation-canvas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useBattleSituationList } from "~/lib/battle-situations/queries";
import type { Scene } from "~/lib/battle-situations/types";

const PAGE_SIZE = 10;

type BattleSituationItem = {
  id: string;
  title: string | null;
  description: string;
  sceneJson: Scene;
  semanticJson: Record<string, unknown>;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

type BattleSituationListPage = {
  items: BattleSituationItem[];
  meta: {
    totalCount: number;
  };
};

const EMPTY_BATTLE_SITUATION_ROWS: BattleSituationItem[] = [];
type BattleSituationColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

const BATTLE_SITUATION_COLUMNS: ColumnDef<BattleSituationItem>[] = [
  {
    id: "title",
    header: "이름",
    accessorFn: (row) => row.title,
    cell: ({ row }) => {
      return row.original.title?.trim() ? row.original.title : "제목 없음";
    },
    meta: {
      headerClassName: "w-[100px]",
      cellClassName: "font-medium",
    } satisfies BattleSituationColumnMeta,
  },
  {
    id: "description",
    header: "설명",
    accessorFn: (row) => row.description,
    meta: {
      cellClassName: "max-w-[420px] truncate",
    } satisfies BattleSituationColumnMeta,
  },
  {
    id: "allyCount",
    header: "아군 수",
    accessorFn: (row) => row.allyCount,
    meta: {
      headerClassName: "w-[100px]",
    } satisfies BattleSituationColumnMeta,
  },
  {
    id: "enemyCount",
    header: "적군 수",
    accessorFn: (row) => row.enemyCount,
    meta: {
      headerClassName: "w-[100px]",
    } satisfies BattleSituationColumnMeta,
  },
  {
    id: "totalCount",
    header: "총 인원",
    accessorFn: (row) => row.totalCount,
    meta: {
      headerClassName: "w-[100px]",
    } satisfies BattleSituationColumnMeta,
  },
];

export const BattleSituationDashboard = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [dismissedError, setDismissedError] = useState<unknown>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const {
    data,
    error,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = useBattleSituationList({ variables: { limit: PAGE_SIZE } });

  const pages = (data?.pages ?? []) as unknown as BattleSituationListPage[];
  const total = pages[0]?.meta.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const maxPageIndex = Math.max(totalPages - 1, 0);
  const currentPageIndex = Math.min(pagination.pageIndex, maxPageIndex);
  const currentPage = pages[currentPageIndex];
  const currentPageNumber = currentPageIndex + 1;
  const rows = currentPage?.items ?? EMPTY_BATTLE_SITUATION_ROWS;
  const isPending = isLoading || isFetchingNextPage;
  const errorMessage =
    error && error !== dismissedError ? toUserMessage(error) : null;
  const resolvedSelectedId =
    selectedId && rows.some((item) => item.id === selectedId)
      ? selectedId
      : rows[0]?.id;

  const selected = useMemo(
    () => rows.find((row) => row.id === resolvedSelectedId),
    [resolvedSelectedId, rows],
  );

  useEffect(() => {
    if (pagination.pageIndex <= maxPageIndex) {
      return;
    }

    setPagination((current) => ({
      ...current,
      pageIndex: maxPageIndex,
    }));
  }, [maxPageIndex, pagination.pageIndex]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable helpers.
  const table = useReactTable({
    data: rows,
    columns: BATTLE_SITUATION_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        ...pagination,
        pageIndex: currentPageIndex,
      },
    },
    onPaginationChange: setPagination,
  });

  const handlePrev = () => {
    if (!table.getCanPreviousPage()) {
      return;
    }

    table.previousPage();
  };

  const handleNext = async () => {
    if (!table.getCanNextPage()) {
      return;
    }

    const nextPageIndex = currentPageIndex + 1;
    if (!pages[nextPageIndex] && hasNextPage) {
      await fetchNextPage();
    }

    table.nextPage();
  };

  return (
    <>
      <ApiErrorDialog
        open={Boolean(errorMessage)}
        message={errorMessage ?? ""}
        onClose={() => setDismissedError(error ?? null)}
      />

      <div
        className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4
          overflow-visible"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>전장 상황</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta as
                        | BattleSituationColumnMeta
                        | undefined;

                      return (
                        <TableHead
                          key={header.id}
                          className={meta?.headerClassName}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isPending && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length}>
                      <div
                        className="text-muted-foreground flex items-center
                          justify-center gap-2 py-8 text-sm"
                      >
                        <Spinner />
                        <span>전장 상황을 불러오는 중입니다.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="text-muted-foreground py-8"
                    >
                      저장된 전장 상황이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const isSelected = row.original.id === resolvedSelectedId;
                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected ? "selected" : undefined}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(row.original.id)}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const meta = cell.column.columnDef.meta as
                            | BattleSituationColumnMeta
                            | undefined;

                          return (
                            <TableCell
                              key={cell.id}
                              className={meta?.cellClassName}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
                {isFetchingNextPage && rows.length > 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="text-muted-foreground py-2 text-center text-xs"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="size-3.5" />
                        다음 페이지를 불러오는 중입니다.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-1">
              <p className="text-muted-foreground text-sm">
                총 {total}개 / {currentPageNumber} / {totalPages} 페이지
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={!table.getCanPreviousPage()}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void handleNext();
                  }}
                  disabled={!table.getCanNextPage() || isFetchingNextPage}
                >
                  다음
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className="flex flex-row items-center justify-between pb-2"
          >
            <CardTitle>선택된 전장 상황</CardTitle>
            {selected ? (
              <Button
                size="sm"
                onClick={() =>
                  router.push(
                    `/battle-situation-builder?battleSituationId=${selected.id}`,
                  )
                }
              >
                <PencilLine />
                수정
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-muted-foreground text-sm">
                좌측 테이블의 row를 선택하면 상세가 표시됩니다.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {selected.title?.trim() ? selected.title : "제목 없음"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {selected.description}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <CountStat label="아군" value={selected.allyCount} />
                  <CountStat label="적군" value={selected.enemyCount} />
                  <CountStat label="총 인원" value={selected.totalCount} />
                </div>
                <div
                  className="bg-muted/30 h-[400px] overflow-hidden rounded-md
                    border p-2"
                >
                  <BattleSituationCanvas
                    scene={selected.sceneJson}
                    draggable={false}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold">Scene JSON</p>
                  <pre
                    className="bg-muted max-h-[260px] overflow-auto rounded-md
                      p-3 text-xs"
                  >
                    {JSON.stringify(selected.sceneJson, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

type CountStatProps = {
  label: string;
  value: number;
};

const CountStat = ({ label, value }: CountStatProps) => {
  return (
    <div className="bg-muted rounded-md px-3 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
};

function toUserMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "요청 처리 중 오류가 발생했습니다.";
}
