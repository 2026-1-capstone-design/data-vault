"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import { signInWithPassword } from "~/lib/auth/sign-in-with-password";
import { supabaseBrowserClient } from "~/shared/supabase/client";

export const PasswordLoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsPending(true);
    setMessage(null);
    setErrorMessage(null);

    const result = await signInWithPassword(supabaseBrowserClient, {
      email,
      password,
    });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsPending(false);
      return;
    }

    setMessage("로그인 성공. 대시보드로 이동합니다.");
    router.replace("/dashboard");
    setIsPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">이메일</FieldLabel>
          <Input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@team-epoch.dev"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner data-icon="inline-start" />
            로그인 중...
          </>
        ) : (
          "ID/PW 로그인"
        )}
      </Button>
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
};
