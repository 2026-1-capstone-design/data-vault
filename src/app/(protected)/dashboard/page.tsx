import { Card, Link } from "@heroui/react";

export default function ProtectedHomePage() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-6
        py-10"
    >
      <Card className="w-full">
        <Card.Header>
          <Card.Title>Protected Platform Area</Card.Title>
          <Card.Description>
            로그인된 사용자만 접근할 수 있는 최소 보호 페이지입니다.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          <p className="text-foreground/80 text-sm">
            이 경로는 Issue #2 기준 인증 게이트의 기준 경로로 사용됩니다.
          </p>
          <Link href="/api/protected/ping">/api/protected/ping 확인</Link>
        </Card.Content>
      </Card>
    </main>
  );
}
