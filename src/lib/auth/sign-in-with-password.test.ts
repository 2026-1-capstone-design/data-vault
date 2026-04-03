import { describe, expect, it } from "vitest";

import { signInWithPassword } from "./sign-in-with-password";

describe("signInWithPassword", () => {
  it("returns ok=true on successful sign-in", async () => {
    const fakeClient = {
      auth: {
        signInWithPassword: async () => ({ error: null }),
      },
    };

    const result = await signInWithPassword(fakeClient, {
      email: "editor@datavault.app",
      password: "pw",
    });

    expect(result).toEqual({ ok: true });
  });

  it("returns an error message on failed sign-in", async () => {
    const fakeClient = {
      auth: {
        signInWithPassword: async () => ({
          error: { message: "Invalid login credentials" },
        }),
      },
    };

    const result = await signInWithPassword(fakeClient, {
      email: "editor@datavault.app",
      password: "wrong",
    });

    expect(result).toEqual({
      ok: false,
      message: "Invalid login credentials",
    });
  });
});
