import { Card, Link } from "@heroui/react";

export default function Home() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-6
        py-10"
    >
      <Card className="w-full">
        <Card.Header>
          <Card.Title>Data Vault Platform Foundation</Card.Title>
          <Card.Description>
            Issue #2 기준 인증/권한/DB 기반 골격이 연결된 상태입니다.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          <Link href="/dashboard">보호 페이지로 이동</Link>
          <Link href="/login">로그인 페이지로 이동</Link>
          <Link href="/api/protected/ping">보호 API 확인</Link>
        </Card.Content>
        <Card.Footer className="flex gap-3">
          <Link className="button button--primary" href="/dashboard">
            Protected
          </Link>
          <Link className="button button--outline" href="/login">
            Login
          </Link>
        </Card.Footer>
      </Card>
    </main>
  );
}
