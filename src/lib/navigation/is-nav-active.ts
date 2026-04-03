type IsDashboardNavActiveInput = {
  currentPathname: string;
  itemHref: string;
};

export function isDashboardNavActive({
  currentPathname,
  itemHref,
}: IsDashboardNavActiveInput): boolean {
  if (itemHref === "/dashboard") {
    return currentPathname === itemHref;
  }

  return (
    currentPathname === itemHref || currentPathname.startsWith(`${itemHref}/`)
  );
}
