"use client";

import {
  type BattleMode,
  useDatasetContext,
} from "~/app/(protected)/dataset/_lib/context";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

import { OptionalTag } from "./optional-tag";

const isBattleMode = (value: string): value is BattleMode =>
  value === "auto" || value === "builder";

export const BattleSection = () => {
  const {
    battleMode,
    setBattleMode,
    enemyCount,
    setEnemyCount,
    allyCount,
    setAllyCount,
    battleDescription,
    setBattleDescription,
  } = useDatasetContext();

  const handleTabChange = (value: string) => {
    if (isBattleMode(value)) setBattleMode(value);
  };

  return (
    <FieldGroup>
      <p className="text-sm font-medium">전장 상황 생성 방식</p>
      <Tabs value={battleMode} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="auto">자동 생성</TabsTrigger>
          <TabsTrigger value="builder">빌더</TabsTrigger>
        </TabsList>

        <TabsContent value="auto">
          <FieldGroup className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="enemy-count">
                  적 수 <OptionalTag />
                </Label>
                <Input
                  id="enemy-count"
                  type="number"
                  min={0}
                  placeholder="예) 10"
                  value={enemyCount}
                  onChange={(e) => setEnemyCount(e.target.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="ally-count">
                  아군 수 <OptionalTag />
                </Label>
                <Input
                  id="ally-count"
                  type="number"
                  min={0}
                  placeholder="예) 5"
                  value={allyCount}
                  onChange={(e) => setAllyCount(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor="battle-description">
                전장 묘사 <OptionalTag />
              </Label>
              <Textarea
                id="battle-description"
                placeholder="전장 상황을 묘사해주세요"
                value={battleDescription}
                onChange={(e) => setBattleDescription(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="builder">
          <div className="mt-3">
            <Button variant="outline">전장 상황 빌더 열기</Button>
          </div>
        </TabsContent>
      </Tabs>
    </FieldGroup>
  );
};
