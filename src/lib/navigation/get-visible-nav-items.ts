import type { RoleName } from "~/lib/authz/guards";

import { DASHBOARD_NAV_ITEMS, type DashboardNavItem } from "./dashboard-nav";

export function getVisibleDashboardNavItems(
  roles: readonly RoleName[],
): DashboardNavItem[] {
  return DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.some((role) => roles.includes(role)),
  );
}
