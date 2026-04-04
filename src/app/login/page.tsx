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
          <CardTitle>로그인</CardTitle>
          <CardDescription>로그인이 필요합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <PasswordLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
