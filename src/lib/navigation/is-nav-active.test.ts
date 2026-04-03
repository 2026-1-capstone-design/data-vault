import { describe, expect, it } from "vitest";

import { isDashboardNavActive } from "./is-nav-active";

describe("isDashboardNavActive", () => {
  it("keeps parent menu active for child routes", () => {
    expect(
      isDashboardNavActive({
        currentPathname: "/dashboard/ideas/weapons/123",
        itemHref: "/dashboard/ideas/weapons",
      }),
    ).toBe(true);

    expect(
      isDashboardNavActive({
        currentPathname: "/dashboard/reviewer",
        itemHref: "/dashboard/ideas/weapons",
      }),
    ).toBe(false);
  });
});
