import { describe, expect, it } from "vitest";

import { isDashboardNavActive } from "./is-nav-active";

describe("isDashboardNavActive", () => {
  it("keeps parent menu active for child routes", () => {
    expect(
      isDashboardNavActive({
        currentPathname: "/ideas/weapons/123",
        itemHref: "/ideas/weapons",
      }),
    ).toBe(true);

    expect(
      isDashboardNavActive({
        currentPathname: "/reviewer",
        itemHref: "/ideas/weapons",
      }),
    ).toBe(false);
  });

  it("marks only exact root path as home active", () => {
    expect(
      isDashboardNavActive({
        currentPathname: "/",
        itemHref: "/",
      }),
    ).toBe(true);

    expect(
      isDashboardNavActive({
        currentPathname: "/battle-situation",
        itemHref: "/",
      }),
    ).toBe(false);
  });
});
