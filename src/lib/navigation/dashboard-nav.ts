import type { RoleName } from "~/lib/authz/guards";

export type DashboardNavIconKey =
  | "house"
  | "swords"
  | "flame"
  | "shield"
  | "scroll-text"
  | "book-open"
  | "hammer"
  | "user-round";

export type DashboardNavItem = {
  key:
    | "dashboard-home"
    | "ideas-weapons"
    | "ideas-skills"
    | "ideas-perks"
    | "ideas-gladiator-names"
    | "battle-situation"
    | "persona"
    | "dataset"
    | "reviewer";
  label: string;
  href: string;
  iconKey: DashboardNavIconKey;
  roles: readonly RoleName[];
};

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    key: "dashboard-home",
    label: "대시보드",
    href: "/dashboard",
    iconKey: "house",
    roles: ["admin", "editor"],
  },
  {
    key: "ideas-weapons",
    label: "무기 아이디어",
    href: "/dashboard/ideas/weapons",
    iconKey: "swords",
    roles: ["admin", "editor"],
  },
  {
    key: "ideas-skills",
    label: "스킬 아이디어",
    href: "/dashboard/ideas/skills",
    iconKey: "flame",
    roles: ["admin", "editor"],
  },
  {
    key: "ideas-perks",
    label: "Perk 아이디어",
    href: "/dashboard/ideas/perks",
    iconKey: "shield",
    roles: ["admin", "editor"],
  },
  {
    key: "ideas-gladiator-names",
    label: "검투사 이름",
    href: "/dashboard/ideas/gladiator-names",
    iconKey: "scroll-text",
    roles: ["admin", "editor"],
  },
  {
    key: "battle-situation",
    label: "전장 상황 편집",
    href: "/dashboard/battle-situation-builder",
    iconKey: "hammer",
    roles: ["admin", "editor"],
  },
  {
    key: "persona",
    label: "페르소나",
    href: "/dashboard/persona",
    iconKey: "user-round",
    roles: ["admin", "editor"],
  },
  {
    key: "dataset",
    label: "데이터셋",
    href: "/dashboard/dataset",
    iconKey: "book-open",
    roles: ["admin", "editor"],
  },
  {
    key: "reviewer",
    label: "데이터셋 리뷰",
    href: "/dashboard/reviewer",
    iconKey: "shield",
    roles: ["admin"],
  },
];
