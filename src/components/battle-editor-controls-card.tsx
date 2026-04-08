import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type BattleEditorControlsCardProps = {
  statusText: string;
  modeText: string;
  titleValue: string;
  descriptionValue: string;
  isPending: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
  onSaveAs: () => void;
};

export const BattleEditorControlsCard = ({
  statusText,
  modeText,
  titleValue,
  descriptionValue,
  isPending,
  onTitleChange,
  onDescriptionChange,
  onReset,
  onSave,
  onSaveAs,
}: BattleEditorControlsCardProps) => {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>작업 컨트롤</CardTitle>
        <CardDescription>
          {modeText} · {statusText}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="battle-situation-title">이름</Label>
          <Input
            id="battle-situation-title"
            value={titleValue}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="예: 아레나 2대2 표준 전장"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="battle-situation-description">설명</Label>
          <Textarea
            id="battle-situation-description"
            value={descriptionValue}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            placeholder="전장 상황의 특징이나 검수 포인트를 적어주세요."
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={onReset} disabled={isPending}>
            초기화
          </Button>
          <Button onClick={onSave} disabled={isPending}>
            저장
          </Button>
          <Button variant="secondary" onClick={onSaveAs} disabled={isPending}>
            다른이름으로 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
