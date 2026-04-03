import { redirect } from "next/navigation";

import { AuthzError } from "~/lib/authz/guards";
import { createServerAccessService } from "~/lib/authz/server-access-service";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const accessService = await createServerAccessService();

  try {
    await accessService.requireAccess(["admin", "editor"]);
  } catch (error) {
    if (error instanceof AuthzError) {
      redirect("/login");
    }

    throw error;
  }

  return <>{children}</>;
}
