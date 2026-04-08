import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type BattleEditorUnitCreateCardProps = {
  onAddUnit: (teamId: string) => void;
};

export const BattleEditorUnitCreateCard = ({
  onAddUnit,
}: BattleEditorUnitCreateCardProps) => {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>유닛 생성</CardTitle>
        <CardDescription>팀별 기본 스탯으로 즉시 추가합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onAddUnit("ally")}>아군 생성</Button>
          <Button onClick={() => onAddUnit("enemy")}>적군 생성</Button>
        </div>
      </CardContent>
    </Card>
  );
};
