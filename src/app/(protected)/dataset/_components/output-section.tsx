"use client";

import { useDatasetContext } from "~/app/(protected)/dataset/_lib/context";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Empty, EmptyDescription, EmptyTitle } from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

import { AreaSituationPreview } from "./area-situation-preview";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-2">
    <h3 className="text-muted-foreground text-sm font-semibold">{title}</h3>
    {children}
  </div>
);

const JsonBlock = ({ value }: { value: unknown }) => (
  <pre
    className="bg-muted/30 w-full max-w-full min-w-0 rounded-lg border p-3
      text-xs wrap-break-word whitespace-pre-wrap"
  >
    {JSON.stringify(value, null, 2)}
  </pre>
);

const TextBlock = ({ value }: { value: string }) => (
  <p
    className="bg-muted/30 rounded-lg border p-3 text-sm leading-relaxed
      whitespace-pre-wrap"
  >
    {value}
  </p>
);

export const OutputSection = () => {
  const { result, errorMessage } = useDatasetContext();

  return (
    <div
      className="flex h-full w-full min-w-0 flex-col gap-4 rounded-2xl border"
    >
      <ScrollArea className="h-0 w-full min-w-0 flex-1">
        <div className="flex min-w-0 flex-col gap-4 p-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>생성 실패</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {!result && !errorMessage && (
            <Empty>
              <EmptyTitle>아직 생성된 데이터셋이 없습니다</EmptyTitle>
              <EmptyDescription>
                왼쪽 입력값을 채우고 &quot;만들기&quot; 버튼을 눌러 데이터셋을
                생성하세요.
              </EmptyDescription>
            </Empty>
          )}

          {result && (
            <div className="flex flex-col gap-6">
              <Section title="System Prompt · Personality">
                <TextBlock value={result.system_prompt.personality} />
              </Section>

              <Section title="System Prompt · Tools">
                <JsonBlock value={result.system_prompt.tools} />
              </Section>

              <Separator />

              <Section title="User Input · Area Situation">
                <div className="flex gap-4">
                  <div className="w-0 flex-1">
                    <JsonBlock value={result.user_input.area_situation} />
                  </div>
                  <div className="w-0 flex-1">
                    <AreaSituationPreview
                      areaSituation={result.user_input.area_situation}
                    />
                  </div>
                </div>
              </Section>

              <Section title="User Input · Command">
                <TextBlock value={result.user_input.command} />
              </Section>

              <Separator />

              <Section title="Output · Thinking">
                <TextBlock value={result.output.thinking} />
              </Section>

              <Section title="Output · Dialog">
                <TextBlock value={result.output.dialog} />
              </Section>

              <Section title="Output · Action">
                <JsonBlock value={result.output.action} />
              </Section>

              <Separator />

              <Section title="Raw JSON">
                <JsonBlock value={result} />
              </Section>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
