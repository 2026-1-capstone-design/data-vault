## Problem Statement

게임 개발 팀이 무기/스킬/perk/검투사 이름 아이디어를 빠르게 축적하고, 검투사 Agent AI 학습용 데이터셋을 일관된 포맷으로 생성·검수·관리할 수 있는 내부 웹 앱이 필요하다. 현재는 데이터 생성 과정(성격 선택/생성, 순응 여부, 전장 상황, 출력 작성)이 분산되어 있어 재현성, 품질 관리, 팀 협업 속도가 떨어진다. 특히 전장 상황과 행동 시퀀스를 시각적으로 확인하고 검수할 수 있는 대시보드형 워크플로우가 필요하다.

## Solution

Next.js 기반 대시보드 웹 앱을 구축해 팀원이 아이디어를 관리하고, Gemini API를 활용해 데이터셋 초안을 대량 생성한 뒤 Reviewer에서 승인하는 표준 파이프라인을 제공한다. 인증은 Supabase Auth, 데이터 저장은 Supabase + Prisma를 사용한다. 전장 상황은 `konva/react-konva`로 직접 편집하며, 데이터는 `scene_json`(캔버스 복원용) + `semantic_json`(학습 입력 친화 구조)으로 이중 저장한다. 생성된 행동 시퀀스는 Konva 캔버스 오버레이(타임라인 재생)로 시각화한다.

## User Stories

1. As an 팀원, I want to 로그인 후에만 앱에 접근할 수 있어야, so that 내부 데이터가 외부에 노출되지 않는다.
2. As an 팀원, I want to 비로그인 상태에서 모든 데이터 접근이 차단되길 원한다, so that 보안 사고를 예방할 수 있다.
3. As an 팀원, I want to 무기 아이디어를 자유롭게 추가/수정/열람하고 싶다, so that 전투 시스템 기획을 빠르게 확장할 수 있다.
4. As an 팀원, I want to 무기 스킬 아이디어를 별도로 관리하고 싶다, so that 무기와 스킬 밸런싱 논의를 분리해서 진행할 수 있다.
5. As an 팀원, I want to perk 아이디어를 카탈로그로 관리하고 싶다, so that 강화 메커니즘 설계 후보를 지속적으로 축적할 수 있다.
6. As an 팀원, I want to 검투사 이름 아이디어를 관리하고 싶다, so that 캐릭터 제작 과정의 작명 품질을 높일 수 있다.
7. As an 팀원, I want to 아이디어 중복 입력을 막지 않되 유사 항목 경고를 보고 싶다, so that 브레인스토밍 자유도를 유지하면서 품질을 관리할 수 있다.
8. As an 팀원, I want to 아이디어 삭제가 완전 삭제가 아니라 보관(soft delete)되길 원한다, so that 과거 의사결정 이력을 추적할 수 있다.
9. As an 팀원, I want to 전장 상황 DB에서 샘플 전장을 생성/편집/열람하고 싶다, so that 반복 가능한 시나리오 기반 데이터셋을 만들 수 있다.
10. As an 팀원, I want to 전장 상황을 마우스로 직접 배치/이동/편집하고 싶다, so that 텍스트 입력보다 빠르게 상황을 구성할 수 있다.
11. As an 팀원, I want to 전장 상황에 유닛 생성/삭제를 할 수 있어야, so that 다양한 전투 구도를 실험할 수 있다.
12. As an 팀원, I want to 유닛을 아군/적군으로 구분하고 좌표를 드래그로 조정하고 싶다, so that 상황 구성이 직관적이어야 한다.
13. As an 팀원, I want to 유닛 기본 스탯(HP/ATK/RANGE)과 무기/스킬 연결을 편집하고 싶다, so that 시나리오의 의미를 명확히 정의할 수 있다.
14. As an 팀원, I want to 전장 상황 JSON을 내보내기/불러오기 하고 싶다, so that 시나리오 재사용과 공유가 쉬워진다.
15. As an 팀원, I want to 데이터셋 Builder에서 검투사 성격을 기존 DB에서 선택하거나 Gemini로 구체화 생성하고 싶다, so that 캐릭터 성향 품질을 빠르게 확보할 수 있다.
16. As an 팀원, I want to 성격(Persona)을 재사용 가능한 엔티티로 관리하고 싶다, so that 여러 샘플에서 일관된 성격을 적용할 수 있다.
17. As an 팀원, I want to Persona 수정 시 덮어쓰기 대신 새 버전으로 저장되길 원한다, so that 과거 샘플 재현성을 유지할 수 있다.
18. As an 팀원, I want to Builder에서 명령 순응/불복 스위치를 명시적으로 선택하고 싶다, so that 행동 데이터 분포를 의도적으로 설계할 수 있다.
19. As an 팀원, I want to 불복 데이터가 부분 순응/우회 순응/명시적 거부를 모두 다루길 원한다, so that 행동 다양성이 높은 학습 데이터를 만들 수 있다.
20. As an 팀원, I want to 전장 상황을 직접 작성하거나 Gemini로 생성하고 싶다, so that 속도와 통제력을 상황에 맞게 선택할 수 있다.
21. As an 팀원, I want to 출력(expected output)을 직접 작성하거나 Gemini로 생성하고 싶다, so that 자동화와 수동 품질 보정을 함께 활용할 수 있다.
22. As an 팀원, I want to Builder 기본 탭이 Gemini 생성이길 원한다, so that 팀의 주 워크플로우를 빠르게 실행할 수 있다.
23. As an 팀원, I want to Gemini 배치 생성 기본값을 5개로 사용하고 싶다, so that 생산성과 검수 부담의 균형을 맞출 수 있다.
24. As an 팀원, I want to 배치 생성 실패 시 부분 성공 항목은 저장되고 실패만 재시도할 수 있길 원한다, so that 작업 중단 없이 진행할 수 있다.
25. As an 팀원, I want to 데이터셋 샘플에 아이디어(무기/스킬/perk/이름)를 선택적으로 연결하고 싶다, so that 출처 추적과 유연성을 동시에 확보할 수 있다.
26. As an 팀원, I want to 샘플의 `battle_context`와 `expected_output`을 JSON으로 저장하고 싶다, so that 구조화된 데이터 처리가 가능해진다.
27. As an 팀원, I want to JSON 구조를 유연하게 확장하되 서버에서 soft validation을 받고 싶다, so that 스키마 변화에 빠르게 대응하면서 품질을 지킬 수 있다.
28. As an 팀원, I want to `expected_output` 최소 키(`thinking_summary`, `actions`, `line`)가 보장되길 원한다, so that 후처리와 리뷰 기준을 통일할 수 있다.
29. As an 팀원, I want to 행동 시퀀스가 확장 가능한 구조(`type`, `intent`, `params`, `anchors`, `result`)를 가지길 원한다, so that 이동/공격/스킬뿐 아니라 포위/후퇴 같은 전술을 점진적으로 지원할 수 있다.
30. As an 팀원, I want to Reviewer에서 액션 시퀀스를 Konva 오버레이로 재생하고 싶다, so that 텍스트만으로 놓치기 쉬운 행동 품질을 시각적으로 검수할 수 있다.
31. As an 팀원, I want to 오버레이에서 Play/Pause/Step/속도(1x/2x)와 현재 step 하이라이트를 보고 싶다, so that 행동 타이밍과 맥락을 정확히 확인할 수 있다.
32. As an 팀원, I want to Dataset Reviewer에서 draft/approved 상태를 기준으로 검수하고 싶다, so that 승인 워크플로우를 명확히 운영할 수 있다.
33. As an 팀원, I want to admin/editor 모두 approve 권한을 갖길 원한다, so that 병목 없이 검수 속도를 낼 수 있다.
34. As an 팀원, I want to approved 샘플은 직접 수정되지 않고 새 draft 버전으로 파생되길 원한다, so that 승인 이력을 안전하게 유지할 수 있다.
35. As an 팀원, I want to Reviewer에서 단건 승인과 다건 일괄 승인을 모두 사용하고 싶다, so that 상황에 맞는 검수 속도를 확보할 수 있다.
36. As an 팀원, I want to 일괄 승인 시 현재 필터 결과에만 적용되고 확인 모달에서 조건/개수를 재확인하고 싶다, so that 대규모 오승인 실수를 방지할 수 있다.
37. As an 운영자, I want to Gemini 프롬프트 템플릿을 DB에서 버전 관리하고 싶다, so that 코드 배포 없이 생성 전략을 개선할 수 있다.
38. As an 운영자, I want to Gemini 요청/응답 원문과 메타데이터를 감사 로그로 저장하고 싶다, so that 품질 회귀와 비용/재현성 이슈를 추적할 수 있다.
39. As an 운영자, I want to API 키를 서버 공용 키 1개로 관리하고 싶다, so that 보안과 운영 복잡도를 낮출 수 있다.
40. As an 운영자, I want to 사용자별 rate limit과 전역 일일 쿼터를 함께 적용하고 싶다, so that 오남용과 비용 폭주를 예방할 수 있다.
41. As an 팀원, I want to Builder에서 전장 상황 DB를 불러오고 현재 편집본을 다시 DB로 저장하고 싶다, so that 재사용 가능한 제작 루프를 만들 수 있다.
42. As an 팀원, I want to 전장 상황도 수정 시 새 버전으로 저장되길 원한다, so that 어떤 버전의 상황으로 샘플이 생성됐는지 추적할 수 있다.
43. As an 팀원, I want to 대시보드 메뉴가 역할 중심으로 분리되어 있길 원한다, so that 필요한 화면으로 빠르게 이동할 수 있다.

## Implementation Decisions

- 기술 스택
- Next.js 기반 대시보드 UI
- Supabase(Postgres + Auth)
- Prisma ORM
- Vercel 배포
- Konva/React-Konva 기반 전장 편집 및 오버레이

- 정보 구조(메뉴)
- 무기 아이디어 관리
- 무기 스킬 아이디어 관리
- perk 아이디어 관리
- 검투사 이름 아이디어 관리
- 전장 상황 DB 관리
- 데이터셋 Builder
- 데이터셋 Reviewer

- 인증/권한
- 단일 팀 워크스페이스 모델
- 역할: `admin`, `editor`
- 비로그인 사용자는 모든 데이터 접근 차단
- `admin/editor` 모두 승인(approve) 가능

- 아이디어 관리 정책
- 중복 입력 허용
- 유사도 경고 제공
- 삭제는 soft delete only

- 핵심 엔티티 및 스키마 방향
- Dataset Sample: `persona_id`, `obedience_mode`, `battle_context(json)`, `expected_output(json)`, `created_by`, `generation_source`, `status`, `version`
- Persona: 별도 엔티티, immutable versioning
- Battle Situation: `scene_json` + `semantic_json` 이중 저장, immutable versioning
- Sample-아이디어 연결: 선택적(0..N)
- JSON은 유연 저장, 서버에서 Zod 기반 soft validation

- Builder 플로우
- Persona 선택/동적 생성(Gemini)
- 순응/불복 스위치
- 전장 상황 수동 작성 또는 Gemini 생성
- Output 수동 작성 또는 Gemini 생성
- 기본 생성 모드: Gemini
- 배치 기본값: 5
- 배치 실패 처리: 부분 성공 저장 + 실패만 재시도

- Expected Output 구조
- 최소 필수 키: `thinking_summary`, `actions`, `line`
- `actions`는 확장형 step 모델 채택: `type`, `intent`, `params`, `anchors`, `result`

- Reviewer/검수
- 상태 기반 워크플로우: `draft` -> `approved`
- approved 직접 수정 금지
- 변경 필요 시 새 draft 버전 파생 후 재승인
- 단건/다건 승인 모두 지원
- 다건 승인 안전장치: 현재 필터 범위 한정 + 확인 모달 재검증

- 전장 오버레이 시각화
- 타임라인 step 재생(Play/Pause/Step, 1x/2x)
- 경로/액션 마커/현재 step 하이라이트
- 전술별 특수 렌더링 대신 MVP 공통 렌더러(anchors 기반)

- Gemini 운영
- 서버 공용 API 키 1개 사용
- 프롬프트 템플릿 DB 버전 관리
- 요청/응답 원문 및 메타 감사 로그 저장(기본 UI 비노출)
- 사용자 rate limit + 전역 일일 쿼터 적용

- 모듈 설계(Deep Module 중심)
- Access Control Module: Auth/RLS/역할 정책을 단일 인터페이스로 캡슐화
- Idea Catalog Module: 4종 아이디어 CRUD, 유사도 경고, soft delete 정책 캡슐화
- Persona Registry Module: 버전형 Persona 저장/조회/선택 로직 캡슐화
- Battle Scene Module: Konva scene와 semantic 변환을 분리하여 테스트 가능한 변환 계층 제공
- Dataset Composer Module: Builder의 입력 조합/검증/샘플 생성 오케스트레이션 담당
- Generation Gateway Module: Gemini 호출, 배치/재시도/부분성공/쿼터 처리 캡슐화
- Review Workflow Module: 상태 전이, 승인 정책, 버전 파생 로직 캡슐화
- Audit Module: 생성 이력 및 템플릿 버전 추적 제공

## Testing Decisions

- 좋은 테스트의 기준
- 내부 구현이 아니라 외부 동작(입력/출력, 상태 전이, 권한 결과)을 검증한다.
- 계약(contract) 기반 테스트를 우선한다(예: JSON soft validation 결과, 승인 정책 결과).
- 시각 컴포넌트는 픽셀 정밀도가 아니라 사용자 행동 기준(재생, 스텝 이동, 필터 반영)으로 검증한다.

- 테스트 대상 모듈
- Access Control Module: 비로그인 차단, 역할별 허용/거부 동작
- Idea Catalog Module: 중복 허용, 유사도 경고, soft delete 동작
- Persona Registry Module: 버전 생성/조회, 참조 무결성
- Battle Scene Module: `scene_json` <-> `semantic_json` 변환 안정성
- Dataset Composer Module: 최소 필드 강제, 버전 파생, 선택적 연결 처리
- Generation Gateway Module: 배치 생성, 부분 성공 저장, 재시도, 제한 정책
- Review Workflow Module: 단건/다건 승인, 필터 범위 제한, 확인 절차

- Prior Art
- 현재 저장소는 초기 스캐폴드 상태로 도메인 테스트 선례가 부족하므로, 모듈 단위 contract 테스트를 우선 표준으로 수립한다.

## Out of Scope

- 학습 파이프라인 상세 설계(train/val/test 분할 전략, 학습 스크립트 통합)
- 학습용 export 포맷/배포 자동화 세부(현재 보류)
- 전술별 고급 커스텀 애니메이션 렌더러
- 멀티 팀/멀티 워크스페이스 권한 모델
- 사용자 개인 Gemini API 키 관리
- 장애물/지형효과/시간축 이벤트가 포함된 고급 전장 에디터

## Further Notes

- 본 PRD는 내부 운영용 데이터셋 관리 MVP를 목표로 하며, 빠른 실사용과 품질 통제를 동시에 달성하는 데 초점을 둔다.
- 초기 릴리스 이후 실제 검수 데이터를 기반으로 템플릿/필터/쿼터 정책을 조정한다.
- 전장 편집과 데이터셋 리뷰는 동일한 의미론(semantic_json, action step schema)을 공유해야 하며, 이를 통해 생성-검수-재사용 루프를 단축한다.
