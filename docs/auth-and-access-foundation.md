# Auth & Access Foundation

이 문서는 `Platform Foundation (DB/Auth/RLS skeleton)` 구현 기준 문서입니다.

## 1. 환경 변수

`.env.example`를 복사해 `.env.local` 또는 `.env`를 준비합니다.

필수 키:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

권장 키:

- `DEFAULT_ADMIN_USER_ID` (seed 시 기본 관리자 매핑)
- `DEFAULT_ADMIN_EMAIL`

## 2. DB 초기화

```bash
pnpm prisma:generate
pnpm prisma:migrate --name init
pnpm prisma:seed
```

Prisma 설정:

- `prisma.config.ts`에서 datasource URL을 관리
- `migrations.seed`로 `tsx prisma/seed.ts` 연결
- Prisma Client는 `provider = "prisma-client"` + `output = "../src/generated/prisma"`
- 런타임은 `@prisma/adapter-pg` + `pg` 기반 단일 인스턴스 사용

## 3. 인증 게이트 경로

- 보호 경로: `/dashboard`
- 로그인 리다이렉트 경로: `/login`
- 단일 진입점: `src/app/(protected)/layout.tsx`

인증 로직:

- Supabase 서버 클라이언트: `src/lib/supabase/server.ts`
- 인증 필수 가드: `requireAuth()` (`src/lib/authz/guards.ts`)

## 4. 공통 권한 가드 경로

권한 로직은 `src/lib/authz`에 집중합니다.

- `requireAuth(user)`
- `requireRole(user, allowedRoles, loadRoles)`
- `canApprove(roles)`

역할 조회는 `src/lib/authz/role-store.ts`를 통해 DB 접근 경계에서 재사용합니다.

## 5. 보호 API 예시

샘플 보호 API:

- `GET /api/protected/ping`
- 파일: `src/app/api/protected/ping/route.ts`

표준 응답:

- 인증 실패: `401 { ok: false, error: "UNAUTHENTICATED" }`
- 권한 실패: `403 { ok: false, error: "FORBIDDEN" }`

## 6. RLS Skeleton

마이그레이션 파일:

- `prisma/migrations/20260403162000_platform_foundation/migration.sql`

적용 내용:

- 코어 테이블 생성 + FK/조회 인덱스
- 앱 레이어 권한 제어를 전제로 DB 레벨의 Supabase Auth/RLS 정책은 포함하지 않음

성능 가이드:

- 권한 필터에 자주 쓰는 컬럼(`created_by_id`, `user_id`, `role_id`) 인덱스 동반 여부 확인

## 7. 테스트

```bash
pnpm test
```

현재 포함된 TDD 범위:

- `src/lib/authz/guards.test.ts`
- `src/lib/authz/protected-ping.test.ts`
