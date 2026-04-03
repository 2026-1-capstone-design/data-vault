"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiErrorDialog } from "~/components/ApiErrorDialog";
import { BattleSituationCanvas } from "~/components/BattleSituationCanvas";
import { DbInteractionOverlay } from "~/components/DbInteractionOverlay";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { SceneJson } from "~/lib/battle-situation-builder/model";
import type { BattleSituationListSort } from "~/lib/battle-situations/service";
import { requestJson } from "~/shared/network/request-json";

type BattleSituationItem = {
  id: string;
  title: string | null;
  description: string;
  sceneJson: SceneJson;
  semanticJson: Record<string, unknown>;
  allyCount: number;
  enemyCount: number;
  totalCount: number;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
};

type BattleSituationListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: BattleSituationListSort;
  sortOrder: "asc" | "desc";
};

type BattleSituationListQuery = Pick<
  BattleSituationListMeta,
  "page" | "pageSize" | "sortBy" | "sortOrder"
>;

const DEFAULT_META: BattleSituationListMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  sortBy: "updatedAt",
  sortOrder: "desc",
};

const SORTABLE_COLUMNS: readonly BattleSituationListSort[] = [
  "allyCount",
  "enemyCount",
  "totalCount",
];

export const BattleSituationDashboard = () => {
  const router = useRouter();
  const [rows, setRows] = useState<BattleSituationItem[]>([]);
  const [meta, setMeta] = useState<BattleSituationListMeta>(DEFAULT_META);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const loadList = useCallback(async (query: BattleSituationListQuery) => {
    setIsPending(true);
    try {
      const params = new URLSearchParams({
        page: String(query.page),
        pageSize: String(query.pageSize),
        sort: query.sortBy,
        order: query.sortOrder,
      });

      const response = await requestJson<
        BattleSituationItem[],
        BattleSituationListMeta
      >(`/api/battle-situations?${params.toString()}`);

      setRows(response.data);
      setMeta((current) => ({
        ...current,
        ...(response.meta ?? {}),
      }));

      setSelectedId((current) => {
        if (current && response.data.some((item) => item.id === current)) {
          return current;
        }
        return response.data[0]?.id;
      });
    } catch (error) {
      setErrorMessage(toUserMessage(error));
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    void loadList({
      page: meta.page,
      pageSize: meta.pageSize,
      sortBy: meta.sortBy,
      sortOrder: meta.sortOrder,
    });
  }, [loadList, meta.page, meta.pageSize, meta.sortBy, meta.sortOrder]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId),
    [rows, selectedId],
  );

  const handleSort = (column: BattleSituationListSort) => {
    if (!SORTABLE_COLUMNS.includes(column)) {
      return;
    }

    setMeta((current) => {
      if (current.sortBy === column) {
        return {
          ...current,
          page: 1,
          sortOrder: current.sortOrder === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...current,
        page: 1,
        sortBy: column,
        sortOrder: "desc",
      };
    });
  };

  const handlePrev = () => {
    if (meta.page <= 1) {
      return;
    }
    setMeta((current) => ({ ...current, page: current.page - 1 }));
  };

  const handleNext = () => {
    if (meta.page >= meta.totalPages) {
      return;
    }
    setMeta((current) => ({ ...current, page: current.page + 1 }));
  };

  return (
    <>
      <DbInteractionOverlay open={isPending} />
      <ApiErrorDialog
        open={Boolean(errorMessage)}
        message={errorMessage ?? ""}
        onClose={() => setErrorMessage(null)}
      />

      <div
        className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4
          overflow-visible"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>전장 상황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">이름</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-[100px]">
                    <SortButton
                      label="아군 수"
                      active={meta.sortBy === "allyCount"}
                      order={meta.sortOrder}
                      onClick={() => handleSort("allyCount")}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <SortButton
                      label="적군 수"
                      active={meta.sortBy === "enemyCount"}
                      order={meta.sortOrder}
                      onClick={() => handleSort("enemyCount")}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <SortButton
                      label="총 인원"
                      active={meta.sortBy === "totalCount"}
                      order={meta.sortOrder}
                      onClick={() => handleSort("totalCount")}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-8"
                    >
                      저장된 전장 상황이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const isSelected = row.id === selectedId;
                    return (
                      <TableRow
                        key={row.id}
                        data-state={isSelected ? "selected" : undefined}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(row.id)}
                      >
                        <TableCell className="font-medium">
                          {row.title?.trim() ? row.title : "제목 없음"}
                        </TableCell>
                        <TableCell className="max-w-[420px] truncate">
                          {row.description}
                        </TableCell>
                        <TableCell>{row.allyCount}</TableCell>
                        <TableCell>{row.enemyCount}</TableCell>
                        <TableCell>{row.totalCount}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-1">
              <p className="text-muted-foreground text-sm">
                총 {meta.total}개 / {meta.page} / {meta.totalPages} 페이지
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={meta.page <= 1}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={meta.page >= meta.totalPages}
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
                    `/dashboard/battle-situation-builder?battleSituationId=${selected.id}`,
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
              <div className="space-y-3">
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
                <div className="space-y-1">
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

type SortButtonProps = {
  label: string;
  active: boolean;
  order: "asc" | "desc";
  onClick: () => void;
};

const SortButton = ({ label, active, order, onClick }: SortButtonProps) => {
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;

  return (
    <Button variant="ghost" size="sm" className="h-8 px-1" onClick={onClick}>
      <span>{label}</span>
      <Icon />
    </Button>
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
