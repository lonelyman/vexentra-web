import { fetchMe } from "@/lib/api/client";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import "@/styles/workspace.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

async function fetchMyAvatarURL(token: string): Promise<string | null> {
   try {
      const res = await fetch(`${API_URL}/me/profile`, {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });
      if (!res.ok) return null;
      const body = await res.json().catch(() => null);
      return body?.data?.profile?.avatar_url || null;
   } catch {
      return null;
   }
}

export default async function WorkspaceLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const token = await requireAuth("/workspace/projects");
   const forcePasswordChange = (await cookies()).get("force_password_change")?.value === "1";
   if (forcePasswordChange) {
      redirect("/force-change-password");
   }

   const { data: me, status } = await fetchMe(token);
   if (!me) handleAuthError(status, "/workspace/projects");
   const avatarUrl = await fetchMyAvatarURL(token);

   return (
      <div className="ws-layout">
         <WorkspaceSidebar username={me.username} email={me.email} role={me.role} avatarUrl={avatarUrl} />
         <div className="ws-content">{children}</div>
      </div>
   );
}
