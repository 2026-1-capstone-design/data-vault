import { redirect } from "next/navigation";

import { createServerAccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";
import { rolesForPolicy } from "~/lib/authz/policy";
import { getVisibleDashboardNavItems } from "~/lib/navigation/get-visible-nav-items";

import { DashboardShell } from "./_components/dashboard-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const accessService = await createServerAccessService();
  let accessContext: Awaited<ReturnType<typeof accessService.requireAccess>>;

  try {
    accessContext = await accessService.requireAccess(
      rolesForPolicy("platformAccess"),
    );
  } catch (error) {
    if (error instanceof AuthzError) {
      redirect("/login");
    }

    throw error;
  }

  const navItems = getVisibleDashboardNavItems(accessContext.roles);

  return (
    <DashboardShell navItems={navItems} userEmail={accessContext.user.email}>
      {children}
    </DashboardShell>
  );
}
