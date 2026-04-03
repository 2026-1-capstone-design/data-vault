# Platform Foundation 해결 계획서: DB/Auth/RLS skeleton
- 작성일: 2026-04-03
- 대상 리포지토리: `2026-1-capstone-design/data-vault`

## 1) 목표와 완료 기준

이 계획서는 Platform Foundation의 Acceptance Criteria 3개를 충족하는 것을 목표로 한다.

1. 보호 대상 데이터 페이지는 인증이 필수이며, 비로그인 사용자는 접근할 수 없다.
2. PRD의 코어 엔티티와 역할 모델(`admin`, `editor`)을 담는 베이스라인 스키마/마이그레이션이 존재한다.
3. 이후 기능 슬라이스가 재사용할 수 있는 공통 권한 가드 경로가 데이터 접근 경계에 연결된다.

## 2) 현재 상태 요약

- 현재 프로젝트는 Next.js 초기 스캐폴드 상태이며 도메인 기능은 미구현 상태.
- `prisma/`, `supabase/` 디렉터리 및 인증/권한 코드가 아직 없음.
- 따라서 Platform Foundation은 **인증/스키마/권한 골격을 처음부터 세팅하는 기반 작업**으로 진행한다.

## 3) 구현 범위

### In Scope

- Supabase Auth 연동 및 세션 기반 접근 제어(서버 경계 중심)
- Prisma 기본 스키마 도입 및 초기 마이그레이션 생성
- 역할 모델(`admin`, `editor`)과 사용자-역할 매핑 구조 도입
- Supabase Postgres RLS skeleton(핵심 테이블 RLS 활성화 + 기본 policy) 도입
- 데이터 접근 계층에서 재사용 가능한 공통 권한 가드 유틸 설계/적용
- 최소 검증용 보호 라우트/샘플 쿼리/권한 실패 응답 정의

### Out of Scope (후속 이슈)

- 실제 도메인 화면(아이디어 CRUD, Builder/Reviewer 등) 완성
- 복잡한 RLS 정책 최적화(초기 골격 이후 점진 고도화)
- 세부 운영 기능(감사 로그 UI, 고급 관리자 도구)

## 4) 상세 실행 계획

## Phase A. 인증 경계 먼저 고정 (Auth Gate)

### A-1. 환경 변수 및 클라이언트 초기화

- `.env.example`에 Supabase/DB 필수 키 추가
- 서버 컴포넌트/라우트 핸들러에서 사용할 Supabase 서버 클라이언트 유틸 생성
- (필요 시) 브라우저 클라이언트 유틸 분리

### A-2. 보호 라우트 정책 적용

- 보호 대상 라우트 그룹(예: `(app)` 또는 `/dashboard/*`) 정의
- 인증 미보유 시 로그인 페이지 또는 지정 경로로 리다이렉트
- 미들웨어/서버 레이아웃 중 **한 곳을 정책의 단일 진입점**으로 고정

### A-3. 인증 상태 확인용 최소 페이지

- 로그인 성공 시 접근 가능한 최소 보호 페이지 1개 생성
- 비로그인 접근 시 차단 동작을 QA 시나리오로 검증

#### A 완료 정의

- 비로그인 사용자가 보호 경로 접근 시 100% 차단
- 로그인 사용자는 정상 진입

## Phase B. DB/Prisma 베이스라인 구축

### B-1. Prisma 도입 및 연결

- Prisma 패키지 설치 및 `prisma/schema.prisma` 생성
- 개발 DB 연결(초기에는 Supabase Postgres 연결 문자열 사용)
- Prisma 7 기준 `prisma.config.ts` 구성(`dotenv/config` 로딩, `datasource.url`은 config에서 관리)
- `schema.prisma`의 datasource는 `provider = "postgresql"`만 유지하고 URL은 두지 않음
- Prisma Client generator를 `provider = "prisma-client"` + 명시적 `output`으로 표준화
- `@prisma/adapter-pg` + `pg` 기반 `PrismaClient({ adapter })` 초기화 및 단일 인스턴스 규약 적용

### B-2. 베이스라인 엔티티 정의 (최소 집합)

- `UserProfile` (Supabase Auth user id와 연결)
- `Role` (`admin`, `editor` 시드)
- `UserRole` (N:M 또는 1:N 정책 중 팀 합의안 반영)
- PRD 코어 엔티티의 최소 골격 테이블
  - 예: `WeaponIdea`, `SkillIdea`, `PerkIdea`, `GladiatorNameIdea`
  - 공통 필드: `id`, `createdAt`, `updatedAt`, `deletedAt(soft delete 대비)`, `createdBy`
- FK/주요 조회 컬럼 인덱스 기본 원칙 반영
  - FK 컬럼(`createdBy`, 관계 키)은 생성 시 인덱스 동반
  - 권한/목록 조회에 쓰는 WHERE/JOIN 컬럼은 초기 인덱스 포함

### B-3. 마이그레이션 및 시드

- `prisma migrate dev --name init`로 초기 마이그레이션 생성
- 역할 시드(`admin`, `editor`)와 기본 관리자 1명 매핑 시드 작성
- 로컬 재현 가능한 초기화 명령 문서화
- `prisma.config.ts`의 seed 엔트리와 실행 명령(`prisma db seed`) 문서화
- SQL 직접 작성이 필요한 경우 제약조건 추가는 idempotent 패턴(조건 확인 후 추가) 준수

#### B 완료 정의

- 초기 마이그레이션 파일이 리포지토리에 존재
- 빈 DB에서 마이그레이션+시드만으로 역할 모델이 재현됨
- Prisma Client가 최신 스키마 기준으로 generate되고 앱에서 정상 로드됨
- FK/핵심 조회 컬럼 인덱스가 마이그레이션에 반영됨

## Phase C. 공통 권한 가드 경로 확립 (Shared Guard Path)

### C-1. 권한 모델 단일화

- `src/lib/authz` 또는 `src/server/authz`에 권한 검사 로직 집중
- 최소 API 정의:
  - `requireAuth()`
  - `requireRole(['admin', 'editor'])`
  - `canApprove()` (현재 정책상 admin/editor 모두 true)

### C-2. 데이터 접근 경계 적용

- API Route/Server Action/Repository 진입부에서 공통 가드 호출
- 라우트 내부에서 직접 역할 문자열 비교 금지(중복 방지)
- 권한 실패 시 표준 에러 코드/응답 형태 통일
- DB 레벨 보호를 위해 핵심 테이블 RLS 활성화(`ENABLE ROW LEVEL SECURITY`)
- 최소 policy 정의
  - authenticated 사용자는 본인 소유 레코드만 접근(`auth.uid()` 기반)
  - admin/editor 정책은 팀 합의된 최소 권한 범위로 시작
- 필요 시 `FORCE ROW LEVEL SECURITY` 적용 여부를 테이블별로 명시

### C-3. 추후 슬라이스를 위한 사용 예시 제공

- 샘플 protected API 1개에 가드 적용 예시 추가
- 팀 컨벤션 문서화: “새 데이터 기능은 반드시 공통 가드 사용”
- RLS 정책 성능 가이드 문서화
  - 정책식의 `auth.uid()`는 `(select auth.uid())` 패턴 사용
  - policy 조건 컬럼 인덱스 동반 여부 체크리스트 포함

#### C 완료 정의

- 최소 1개 이상의 데이터 접근 경계에서 공통 가드 사용 확인
- 이후 기능에서 복붙 가능한 참조 패턴이 코드로 존재
- 최소 1개 코어 테이블에서 RLS + policy 동작이 검증됨

## Phase D. 검증/문서화/머지 준비

### D-1. 테스트 체크리스트

- 비로그인 사용자 보호 라우트 차단
- 로그인 + `editor` 허용 동작
- 로그인 + 권한 없음(또는 매핑 없음) 거부 동작
- 마이그레이션 fresh DB 적용 성공
- 역할 시드 정상 반영
- 핵심 테이블 RLS 활성화 및 policy 존재 확인
- 본인 데이터 접근/타인 데이터 거부 시나리오 검증(RLS)
- Prisma Client 생성/초기화(어댑터 포함) 동작 확인
- service role(우회 가능 권한) 사용 경로는 서버 전용으로 제한됨을 확인

### D-2. 문서 업데이트

- `docs/`에 설치/마이그레이션/시드/권한 규약 문서 추가
- README의 “현재 구현 상태”를 구현 기준으로 갱신

### D-3. PR 준비

- 변경 범위를 Auth/Schema/AuthZ로 명확히 분리해서 리뷰 가능하도록 커밋 구성
- PR 본문에 Acceptance Criteria 대응 표 포함

## 5) 파일/디렉터리 생성 계획 (예시)

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`
- `prisma.config.ts`
- `src/lib/supabase/server.ts`
- `src/lib/prisma.ts`
- `src/lib/authz/guards.ts`
- `src/app/(protected)/layout.tsx` 또는 대응 미들웨어 파일
- `src/app/(protected)/page.tsx` (최소 보호 페이지)
- `docs/auth-and-access-foundation.md` (구현 후 운영 문서)

## 6) 리스크 및 대응

- Supabase Auth 사용자와 Prisma 사용자 모델 불일치 위험
  - 대응: `auth.users.id`를 기준 키로 채택하고 프로필 테이블은 보조 정보만 저장
- 권한 로직 분산 위험
  - 대응: 공통 가드 모듈 외 직접 role 비교 금지 규칙 적용
- 초기 마이그레이션 과대설계 위험
  - 대응: 본 단계에서는 “골격 + 확장 가능한 최소 필드” 원칙 유지

## 7) 예상 작업 순서 (권장)

1. Auth 보호 경계(A) 완료
2. Prisma 베이스라인/마이그레이션(B) 완료
3. 공통 권한 가드(C) 연결
4. 검증/문서화/PR(D)

## 8) 완료 판정 체크리스트

- [ ] 비로그인 사용자는 보호 데이터 경로에 접근할 수 없다.
- [ ] `admin`, `editor` 역할이 DB 스키마/시드로 재현된다.
- [ ] 공통 권한 가드 경로가 데이터 접근 경계에 실제로 연결되어 있다.
- [ ] 핵심 테이블 RLS/policy skeleton이 마이그레이션으로 재현된다.
- [ ] Prisma 7 구성(`prisma.config.ts`, adapter 기반 Client)이 문서/코드에 반영되어 있다.
- [ ] 후속 이슈에서 재사용할 기준 문서가 `docs/`에 존재한다.
