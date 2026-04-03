import { describe, expect, it } from "vitest";

import { hasPolicyAccess, rolesForPolicy } from "./policy";

describe("rolesForPolicy", () => {
  it("returns configured roles for platform access", () => {
    expect(rolesForPolicy("platformAccess")).toEqual(["admin", "editor"]);
  });
});

describe("hasPolicyAccess", () => {
  it("returns true when at least one required role is present", () => {
    expect(hasPolicyAccess("approvalAccess", ["editor"])).toBe(true);
  });

  it("returns false when required roles are missing", () => {
    expect(hasPolicyAccess("platformAccess", [])).toBe(false);
  });
});
