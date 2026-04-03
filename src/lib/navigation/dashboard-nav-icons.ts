import {
  BookOpen,
  Flame,
  Hammer,
  House,
  ScrollText,
  Shield,
  Swords,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { DashboardNavIconKey } from "./dashboard-nav";

export const DASHBOARD_NAV_ICON_MAP: Record<DashboardNavIconKey, LucideIcon> = {
  "book-open": BookOpen,
  flame: Flame,
  hammer: Hammer,
  house: House,
  "scroll-text": ScrollText,
  shield: Shield,
  swords: Swords,
  "user-round": UserRound,
};
