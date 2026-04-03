import { describe, expect, it } from "vitest";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav";

describe("DASHBOARD_NAV_ITEMS", () => {
  it("routes battle situation nav item to battle-situation", () => {
    const item = DASHBOARD_NAV_ITEMS.find(
      (entry) => entry.key === "battle-situation",
    );

    expect(item?.href).toBe("/dashboard/battle-situation");
  });
});
