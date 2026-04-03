type PasswordSignInInput = {
  email: string;
  password: string;
};

type PasswordSignInClient = {
  auth: {
    signInWithPassword: (
      _input: PasswordSignInInput,
    ) => Promise<{ error: { message: string } | null }>;
  };
};

type PasswordSignInResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export async function signInWithPassword(
  client: PasswordSignInClient,
  input: PasswordSignInInput,
): Promise<PasswordSignInResult> {
  const { error } = await client.auth.signInWithPassword(input);

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
  };
}
