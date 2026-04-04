import { redirect } from "next/navigation";

import { createServerAccessService } from "~/lib/authz/access-service";
import { AuthzError } from "~/lib/authz/guards";

export default async function ReviewerPage() {
  const accessService = await createServerAccessService();

  try {
    await accessService.requireAccess(["admin"]);
  } catch (error) {
    if (error instanceof AuthzError) {
      redirect("/");
    }

    throw error;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Reviewer</h1>
      <p className="text-foreground/70 text-sm">
        Reviewer 워크플로우는 현재 admin 역할만 접근 가능합니다.
      </p>
    </div>
  );
}
