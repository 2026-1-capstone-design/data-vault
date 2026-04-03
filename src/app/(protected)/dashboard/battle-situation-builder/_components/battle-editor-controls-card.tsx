import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type BattleEditorControlsCardProps = {
  statusText: string;
  onReset: () => void;
  onSave: () => void;
  onSaveAs: () => void;
};

export const BattleEditorControlsCard = ({
  statusText,
  onReset,
  onSave,
  onSaveAs,
}: BattleEditorControlsCardProps) => {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>작업 컨트롤</CardTitle>
        <CardDescription>{statusText}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={onReset}>
            초기화
          </Button>
          <Button onClick={onSave}>저장</Button>
          <Button variant="secondary" onClick={onSaveAs}>
            다른이름으로 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
