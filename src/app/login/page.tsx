import { Card, Link } from "@heroui/react";

import { MagicLinkForm } from "./_components/magic-link-form";

export default function LoginPage() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-6
        py-10"
    >
      <Card className="w-full">
        <Card.Header>
          <Card.Title>Login Required</Card.Title>
          <Card.Description>
            Supabase Auth를 통해 로그인 후 보호 경로로 접근하세요.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          <p className="text-foreground/80 text-sm">
            이 화면은 인증 미보유 접근 시 리다이렉트 도착점입니다.
          </p>
          <MagicLinkForm />
          <Link href="/">홈으로 돌아가기</Link>
        </Card.Content>
      </Card>
    </main>
  );
}
