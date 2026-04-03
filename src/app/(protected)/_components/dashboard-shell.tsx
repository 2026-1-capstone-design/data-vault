import { Card, CardContent } from "~/components/ui/card";
import type { DashboardNavItem } from "~/lib/navigation/dashboard-nav";

import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: readonly DashboardNavItem[];
};

export const DashboardShell = ({ children, navItems }: DashboardShellProps) => {
  return (
    <div className="h-screen w-full overflow-hidden p-4">
      <div className="flex h-full w-full gap-4">
        <Card
          className="sticky top-4 h-[calc(100vh-2rem)] w-48 shrink-0 bg-black
            py-4 text-white"
        >
          <CardContent className="h-full overflow-y-auto px-2">
            <DashboardSidebar items={navItems} />
          </CardContent>
        </Card>

        <section
          className="flex h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col gap-4
            overflow-y-auto p-0.5 pr-1"
        >
          {children}
        </section>
      </div>
    </div>
  );
};
