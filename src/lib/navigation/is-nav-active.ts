type IsDashboardNavActiveInput = {
  currentPathname: string;
  itemHref: string;
};

export function isDashboardNavActive({
  currentPathname,
  itemHref,
}: IsDashboardNavActiveInput): boolean {
  if (itemHref === "/") {
    return currentPathname === itemHref;
  }

  return (
    currentPathname === itemHref || currentPathname.startsWith(`${itemHref}/`)
  );
}
