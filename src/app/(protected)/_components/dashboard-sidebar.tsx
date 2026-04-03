"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DashboardNavItem } from "~/lib/navigation/dashboard-nav";
import { DASHBOARD_NAV_ICON_MAP } from "~/lib/navigation/dashboard-nav-icons";
import { isDashboardNavActive } from "~/lib/navigation/is-nav-active";
import { cn } from "~/lib/utils";

type DashboardSidebarProps = {
  items: readonly DashboardNavItem[];
};

export const DashboardSidebar = ({ items }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex w-full flex-col gap-1"
    >
      {items.map((item) => {
        const Icon = DASHBOARD_NAV_ICON_MAP[item.iconKey];
        const isActive = isDashboardNavActive({
          currentPathname: pathname,
          itemHref: item.href,
        });

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm
              text-white no-underline transition-colors`,
              isActive ? "bg-white/20" : "bg-transparent hover:bg-white/10",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
