import { describe, expect, it } from "vitest";

import { DASHBOARD_NAV_ITEMS } from "./dashboard-nav";

describe("DASHBOARD_NAV_ITEMS", () => {
  it("routes battle situation nav item to battle-situation", () => {
    const item = DASHBOARD_NAV_ITEMS.find(
      (entry) => entry.key === "battle-situation",
    );

    expect(item?.href).toBe("/battle-situation");
  });

  it("enables only battle situation entries", () => {
    const enabledKeys = DASHBOARD_NAV_ITEMS.filter(
      (item) => !item.disabled,
    ).map((item) => item.key);

    expect(enabledKeys).toEqual([
      "battle-situation",
      "battle-situation-builder",
    ]);
  });
});
