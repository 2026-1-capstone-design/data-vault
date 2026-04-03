import { createProtectedPingResponse } from "~/lib/authz/protected-ping";
import { loadUserRoles } from "~/lib/authz/role-store";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  return createProtectedPingResponse({
    getCurrentUser: async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email,
      };
    },
    loadRoles: loadUserRoles,
  });
}
