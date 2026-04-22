import { fetchMe } from "@/lib/api/client";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import "@/styles/workspace.css";

export default async function WorkspaceLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const token = await requireAuth("/workspace/projects");

   const { data: me, status } = await fetchMe(token);
   if (!me) handleAuthError(status, "/workspace/projects");

   return (
      <div className="ws-layout">
         <WorkspaceSidebar username={me.username} email={me.email} role={me.role} />
         <div className="ws-content">{children}</div>
      </div>
   );
}
