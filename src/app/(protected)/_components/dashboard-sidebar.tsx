"use client";

import { Card, Link } from "@heroui/react";
import { usePathname } from "next/navigation";

import type { DashboardNavItem } from "~/lib/navigation/dashboard-nav";
import { DASHBOARD_NAV_ICON_MAP } from "~/lib/navigation/dashboard-nav-icons";
import { isDashboardNavActive } from "~/lib/navigation/is-nav-active";

type DashboardSidebarProps = {
  items: readonly DashboardNavItem[];
};

export const DashboardSidebar = ({ items }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="w-full space-y-1">
      {items.map((item) => {
        const Icon = DASHBOARD_NAV_ICON_MAP[item.iconKey];
        const isActive = isDashboardNavActive({
          currentPathname: pathname,
          itemHref: item.href,
        });

        return (
          <Card
            key={item.key}
            className={
              isActive
                ? "bg-white/20 p-0"
                : "bg-transparent p-0 hover:bg-white/10"
            }
            variant="transparent"
          >
            <Link
              href={item.href}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2
                text-sm text-white no-underline"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Card>
        );
      })}
    </nav>
  );
};
