import { redirect } from "next/navigation";

import { AuthzError, requireAuth } from "~/lib/authz/guards";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    redirect("/login");
  }

  try {
    requireAuth(
      data.user
        ? {
            id: data.user.id,
            email: data.user.email,
          }
        : null,
    );
  } catch (error) {
    if (error instanceof AuthzError && error.code === "UNAUTHENTICATED") {
      redirect("/login");
    }

    throw error;
  }

  return <>{children}</>;
}
