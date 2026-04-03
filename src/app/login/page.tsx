import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { PasswordLoginForm } from "./_components/password-login-form";

export default function LoginPage() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-6
        py-10"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login Required</CardTitle>
          <CardDescription>
            Supabase Auth를 통해 로그인 후 보호 경로로 접근하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            이 화면은 인증 미보유 접근 시 리다이렉트 도착점입니다.
          </p>
          <PasswordLoginForm />
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/"
          >
            홈으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
