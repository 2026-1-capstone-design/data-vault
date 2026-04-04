import { BattleEditor } from "./_components/battle-editor";

export default async function BattleSituationBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const battleSituationId = (await searchParams)["battleSituationId"] ?? "-1";
  return <BattleEditor key={battleSituationId} />;
}
