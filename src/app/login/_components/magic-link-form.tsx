"use client";

import { Alert, Button, Form, Input, Label } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { signInWithPassword } from "~/lib/auth/sign-in-with-password";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";

export const MagicLinkForm = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
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

    const result = await signInWithPassword(supabase, {
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
    <Form onSubmit={onSubmit} className="space-y-3">
      <Label htmlFor="login-email" isRequired>
        이메일
      </Label>
      <Input
        id="login-email"
        name="email"
        type="email"
        placeholder="you@team-epoch.dev"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        fullWidth
      />
      <Label htmlFor="login-password" isRequired>
        비밀번호
      </Label>
      <Input
        id="login-password"
        name="password"
        type="password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="primary" fullWidth isPending={isPending}>
        ID/PW 로그인
      </Button>
      {message ? (
        <Alert status="success">
          <p className="text-sm">{message}</p>
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert status="danger">
          <p className="text-sm">{errorMessage}</p>
        </Alert>
      ) : null}
    </Form>
  );
};
