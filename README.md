# Data Vault Web App

검투사단 운영 시뮬레이션 게임 개발을 위한 **내부 데이터셋/아이디어 관리 웹 앱**입니다.

이 프로젝트는 팀이 무기/스킬/perk/검투사 이름 아이디어를 축적하고, Gemini 기반으로 Agent 학습용 샘플을 생성·검수·버전 관리할 수 있는 대시보드 구축을 목표로 합니다.

## 프로젝트 목표

- 게임 기획 아이디어(무기, 스킬, perk, 이름)를 빠르게 수집/관리
- 전장 상황과 행동 시퀀스를 구조화된 JSON으로 생성/검수
- Gemini API 기반 배치 생성 + 리뷰 승인 워크플로우 표준화
- 데이터 재현성을 위한 버전 관리(페르소나/전장/샘플)

## 핵심 기능 (PRD 기준)

- 인증/권한
- Supabase Auth 기반 로그인 필수 접근
- 역할: `admin`, `editor` (둘 다 approve 가능)

- 아이디어 카탈로그
- 무기/무기 스킬/perk/검투사 이름 CRUD
- 중복 입력 허용 + 유사도 경고
- 삭제는 soft delete only

- 전장 상황 관리
- Konva 기반 시각 편집(유닛 생성/삭제/이동)
- `scene_json` + `semantic_json` 이중 저장
- 전장 버전 관리(immutable)

- 데이터셋 Builder
- Persona 선택 또는 Gemini 생성
- 순응/불복 모드 선택
- 전장/출력 수동 작성 또는 Gemini 생성
- 기본 생성 모드: Gemini, 기본 배치 수: 5
- 배치 실패 시 부분 성공 저장 + 실패 항목 재시도

- 데이터셋 Reviewer
- 상태 기반 검수: `draft` -> `approved`
- 단건/다건 승인
- 다건 승인 안전장치(현재 필터 범위 + 확인 모달)
- 액션 시퀀스 Konva 오버레이 재생(Play/Pause/Step, 1x/2x)

## 데이터 구조 방향

- Dataset Sample
- `persona_id`, `obedience_mode`, `battle_context(json)`, `expected_output(json)`, `created_by`, `generation_source`, `status`, `version`

- Expected Output 최소 키
- `thinking_summary`, `actions`, `line`

- Actions 확장 스키마
- `type`, `intent`, `params`, `anchors`, `result`

## 기술 스택

- Next.js (App Router)
- React
- Supabase (Postgres + Auth)
- Prisma ORM
- Konva / React-Konva
- Vercel

## 현재 구현 상태

현재 저장소는 **초기 스캐폴드 단계**이며, 도메인 기능은 PRD 기준으로 설계 중/구현 예정입니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 스크립트

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## 문서

- [프로젝트 제안서](./docs/project-proposal.md)
- [Data Vault 웹앱 PRD](./docs/prd-data-vault-webapp.md)

---

본 README는 `docs/`의 기획 문서를 기준으로 작성되었습니다.
