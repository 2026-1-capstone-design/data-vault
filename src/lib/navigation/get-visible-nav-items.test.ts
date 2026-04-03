import { describe, expect, it } from "vitest";

import { getVisibleDashboardNavItems } from "./get-visible-nav-items";

describe("getVisibleDashboardNavItems", () => {
  it("hides admin-only entries for editor users", () => {
    const adminItems = getVisibleDashboardNavItems(["admin"]);
    const editorItems = getVisibleDashboardNavItems(["editor"]);

    expect(adminItems.some((item) => item.key === "reviewer")).toBe(true);
    expect(editorItems.some((item) => item.key === "reviewer")).toBe(false);
  });
});
