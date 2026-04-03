import { redirect } from "next/navigation";

import { createServerAccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";
import { rolesForPolicy } from "~/lib/authz/policy";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const accessService = await createServerAccessService();

  try {
    await accessService.requireAccess(rolesForPolicy("platformAccess"));
  } catch (error) {
    if (error instanceof AuthzError) {
      redirect("/login");
    }

    throw error;
  }

  return <>{children}</>;
}
