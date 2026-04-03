import { Avatar, Card } from "@heroui/react";

type DashboardTopbarProps = {
  userEmail?: string | null;
};

export const DashboardTopbar = ({ userEmail }: DashboardTopbarProps) => {
  return (
    <Card
      className="flex h-16 w-full items-center justify-between px-5"
      variant="secondary"
    >
      <div>
        <p className="text-foreground/60 text-xs tracking-[0.12em] uppercase">
          Data Vault
        </p>
        <p className="text-sm font-semibold">Dashboard</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-foreground/70 text-sm">
          {userEmail ?? "authenticated-user@datavault.app"}
        </span>
        <Avatar size="sm">
          <Avatar.Fallback>
            {(userEmail ?? "User").slice(0, 1).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
      </div>
    </Card>
  );
};
