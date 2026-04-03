import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function Home() {
  return (
    <main
      className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-6
        py-10"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Data Vault Platform Foundation</CardTitle>
          <CardDescription>
            Issue #2 기준 인증/권한/DB 기반 골격이 연결된 상태입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/dashboard"
          >
            보호 페이지로 이동
          </Link>
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/login"
          >
            로그인 페이지로 이동
          </Link>
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/api/protected/ping"
          >
            보호 API 확인
          </Link>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard">Protected</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
