import type { BattleMode } from "~/app/(protected)/dataset/_lib/context";

/**
 * Inputs gathered from the `/dataset` route used to ask Gemini for a dataset
 * sample. Mirrors the fields in `DatasetContextValue`.
 */
export interface DatasetPromptInput {
  personaPrompt: string;
  usePersonaAsIs: boolean;

  battleMode: BattleMode;
  enemyCount: string;
  allyCount: string;
  battleDescription: string;

  commanderOrderPrompt: string;
  willDisobeyCommand: boolean;

  gladiatorActionPrompt: string;
  dialoguePrompt: string;
}

/**
 * Shape of the JSON Gemini must return. Mirrors the example provided in the
 * task description.
 */
export interface DatasetSample {
  system_prompt: {
    personality: string;
    tools: [
      {
        type: "move";
        subtype: "absolute";
        description: string;
        parameters: { target: string };
      },
      {
        type: "move";
        subtype: "relative";
        description: string;
        parameters: { from: string; offset: string };
      },
      { type: "attack"; description: string; parameters: { target: string } },
      {
        type: "skill";
        description: string;
        parameters: { description: string; target: string };
      },
    ];
  };
  user_input: {
    area_situation: {
      arena: {
        shape: "circle";
        center: { x: number; y: number };
        radius: number;
      };
      allies: Array<{
        unitId: string;
        position: { x: number; y: number };
        stats: { hp: number; atk: number; range: number };
        skillDescription?: string;
      }>;
      enemies: Array<{
        unitId: string;
        position: { x: number; y: number };
        stats: { hp: number; atk: number; range: number };
        skillDescription?: string;
      }>;
    };
    command: string;
  };
  output: {
    thinking: string;
    dialog: string;
    action: Array<{ type: string; [key: string]: unknown }>;
  };
}

const SYSTEM_INSTRUCTION = `당신은 검투사 AI 학습용 데이터셋을 생성하는 보조자입니다.
당신의 임무는 사용자가 제공한 조건들을 바탕으로, 검투사 한 명의 전투 상황 데이터셋 샘플 1건을 JSON 형식으로 생성하는 것입니다.

[출력 형식]
반드시 아래 키를 갖는 JSON 객체 하나만 출력하세요. 마크다운 코드 펜스(\`\`\`)나 추가 설명은 절대 포함하지 마세요.

{
  "system_prompt": {
    "personality": string, // 검투사의 역할/성격을 2~4문장으로 묘사. 반드시 "당신은 ~~입니다." 와 같이 독자(검투사 본인)에게 2인칭으로 지시하는 형식으로 작성. "저는", "나는" 같이 자기 소개/1인칭 형식은 절대 사용하지 말 것.
    "tools": [               // 고정된 도구 목록 — 아래 4가지를 변경 없이 그대로 출력
      { "type": "move", "subtype": "absolute", "description": "절대 좌표로 이동", "parameters": { "target": "[num, num] — 이동할 절대 좌표" } },
      { "type": "move", "subtype": "relative", "description": "특정 유닛을 기준으로 상대 좌표로 이동", "parameters": { "from": "unit — 기준 유닛 ID", "offset": "[num, num] — 기준 유닛으로부터의 상대 좌표" } },
      { "type": "attack", "description": "대상 유닛을 공격", "parameters": { "target": "unit — 공격 대상 유닛 ID" } },
      { "type": "skill", "description": "스킬 사용", "parameters": { "description": "string — 사용할 스킬 설명", "target": "unit — 스킬 대상 유닛 ID" } }
    ]
  },
  "user_input": {
    "area_situation": {     // 전장 상황.
      "arena": { "shape": "circle", "center": { "x": 0, "y": 0 }, "radius": 200 },
      "allies": [
        {
          "unitId": string,                     // 예: "A_01". 유닛의 이름(name)은 절대 포함하지 말 것.
          "position": { "x": number, "y": number },
          "stats": { "hp": number, "atk": number, "range": number },
          "skillDescription": string           // 선택, 필요한 경우에만
        }
      ],
      "enemies": [ /* allies 와 동일한 형식. unitId 는 "E_01" 등. name 필드 금지. */ ]
    },
    "command": string       // 지휘관의 명령. 유닛 참조는 반드시 "{A_01}", "{E_02}" 처럼 중괄호로 감싼 unitId 형태로 작성. 절대 실제 이름으로 치환하지 마세요.
                            // e.g. "{A_01}에게 돌격해라"
  },
  "output": {
    "thinking": string,     // 검투사가 명령을 받고 행동을 결정하기까지의 1인칭 사고 흐름. 페르소나의 말투/성격을 반영.
    "dialog": string,       // 검투사가 실제로 외치는 대사. 다른 유닛 참조는 동일하게 "{A_03}" 형태 유지.
    "action": [             // 아래 4가지 형식 중 하나 이상의 시퀀스. 명령과 사고 흐름에 부합해야 함.
      // move(절대):   { "type": "move", "subtype": "absolute", "target": [num, num] }
      // move(상대):   { "type": "move", "subtype": "relative", "from": "unit_id", "offset": [num, num] }
      // attack:      { "type": "attack", "target": "unit_id" }
      // skill:       { "type": "skill", "description": "스킬 설명", "target": "unit_id" }
    ]
  }
}

[규칙]
1. 출력은 위 스키마를 만족하는 단 하나의 JSON 객체여야 합니다.
2. \`command\`, \`dialog\` 안에서 다른 유닛을 가리킬 때는 반드시 "{A_01}", "{E_02}" 같이 중괄호로 감싼 unitId 를 그대로 남겨두세요. 이후 문자열 치환에 사용됩니다.
3. \`system_prompt.tools\` 는 위에 명시된 4개 항목을 내용 변경 없이 그대로 출력해야 합니다. 추가·삭제·수정 불가.
   \`output.action\` 의 각 항목은 반드시 위 4가지 형식(\`move/absolute\`, \`move/relative\`, \`attack\`, \`skill\`) 중 하나여야 합니다.
4. 페르소나, 사고 흐름(thinking), 대사(dialog) 의 톤은 일관되어야 합니다.
5. \`arena\` 는 항상 \`{ "shape": "circle", "center": { "x": 0, "y": 0 }, "radius": 200 }\` 으로 고정하세요. 유닛 좌표는 이 원 안에 들어오도록 합리적인 정수를 사용하세요.
6. 사용자가 명령 불복종을 요청한 경우, thinking/dialog/action 에서 명령과 어긋나는 행동을 자연스럽게 표현하세요.
7. 어떤 유닛의 이름(고유 명칭)도 출력 어디에도 등장시키지 마세요. \`allies\`/\`enemies\` 항목에 \`name\` 필드를 포함하지 말고, \`thinking\`/\`dialog\`/\`command\` 에서도 유닛을 부를 때는 반드시 "{A_01}", "{E_02}" 같은 중괄호 unitId 플레이스홀더만 사용하세요. 이름 기반 호칭(예: "아이언씨", "철수") 을 절대 쓰지 마세요.
8. \`system_prompt.personality\` 는 "당신은 ~~입니다." 처럼 검투사에게 2인칭으로 정체성과 성격을 지시하는 문장들로만 구성하세요. "저는 ...", "나는 ..." 과 같이 검투사가 스스로를 소개하는 1인칭 문장은 금지입니다. 또한 유닛의 이름을 포함시키지 마세요.
9. 행동 주체(데이터셋의 검투사)는 항상 \`A_01\` 로 고정합니다. \`allies\` 배열의 첫 번째 항목은 반드시 \`"unitId": "A_01"\` 이어야 하며, \`thinking\`/\`dialog\`/\`action\` 은 모두 A_01 의 시점에서 작성합니다.`;

const formatBoolean = (value: boolean) => (value ? "예" : "아니오");

const formatOptional = (label: string, value: string) => {
  const trimmed = value.trim();
  return `- ${label}: ${trimmed.length > 0 ? trimmed : "(미지정 — 적절히 생성)"}`;
};

const buildBattleSituationSection = (input: DatasetPromptInput): string => {
  if (input.battleMode === "builder") {
    return [
      "[전장 상황]",
      "- 생성 방식: 빌더 (현재는 사용자 정의 빌더 데이터가 제공되지 않았으므로 적절히 생성)",
    ].join("\n");
  }

  return [
    "[전장 상황]",
    "- 생성 방식: 자동 생성",
    formatOptional("적 수", input.enemyCount),
    formatOptional("아군 수", input.allyCount),
    formatOptional("전장 묘사", input.battleDescription),
  ].join("\n");
};

export const buildDatasetUserPrompt = (input: DatasetPromptInput): string => {
  const sections: string[] = [];

  sections.push(
    [
      "[페르소나]",
      formatOptional("페르소나 프롬프트", input.personaPrompt),
      `- 입력 그대로 사용: ${formatBoolean(input.usePersonaAsIs)}`,
      input.usePersonaAsIs
        ? "  → 위 페르소나 프롬프트를 가공하지 말고 그대로 personality 로 사용하세요."
        : "  → 위 프롬프트를 바탕으로 자연스러운 personality 문장을 작성하세요.",
    ].join("\n"),
  );

  sections.push(buildBattleSituationSection(input));

  sections.push(
    [
      "[지휘관의 명령]",
      formatOptional("명령 생성 프롬프트", input.commanderOrderPrompt),
      `- 명령 불복종 여부: ${formatBoolean(input.willDisobeyCommand)}`,
    ].join("\n"),
  );

  sections.push(
    [
      "[검투사 행동 지시]",
      formatOptional("행동 지시 프롬프트", input.gladiatorActionPrompt),
    ].join("\n"),
  );

  sections.push(
    [
      "[검투사 대사 지시]",
      formatOptional("대사 프롬프트", input.dialoguePrompt),
    ].join("\n"),
  );

  sections.push(
    "위 조건을 모두 반영하여 시스템 프롬프트에 명시된 JSON 스키마를 만족하는 데이터셋 샘플 1건을 출력하세요.",
  );

  return sections.join("\n\n");
};

export interface BuiltDatasetPrompt {
  systemInstruction: string;
  userPrompt: string;
}

export const buildDatasetPrompt = (
  input: DatasetPromptInput,
): BuiltDatasetPrompt => ({
  systemInstruction: SYSTEM_INSTRUCTION,
  userPrompt: buildDatasetUserPrompt(input),
});
