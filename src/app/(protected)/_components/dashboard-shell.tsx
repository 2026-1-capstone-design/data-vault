import { Card } from "@heroui/react";

import type { DashboardNavItem } from "~/lib/navigation/dashboard-nav";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: readonly DashboardNavItem[];
  userEmail?: string | null;
};

export const DashboardShell = ({
  children,
  navItems,
  userEmail,
}: DashboardShellProps) => {
  return (
    <div className="w-full p-8">
      <div className="flex min-h-[calc(100vh-4rem)] w-full gap-6">
        <Card className="h-auto w-72 shrink-0 bg-black p-4 text-white">
          <Card.Content className="px-0">
            <DashboardSidebar items={navItems} />
          </Card.Content>
        </Card>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <DashboardTopbar userEmail={userEmail} />
          <Card className="min-h-[calc(100vh-9rem)] p-6">{children}</Card>
        </section>
      </div>
    </div>
  );
};
