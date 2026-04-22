import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/api/client";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import "@/styles/workspace.css";

export default async function WorkspaceLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const token = (await cookies()).get("token")?.value;
   if (!token) redirect("/login");

   const { data: me, status } = await fetchMe(token);
   if (!me) {
      if (status === 401) {
         redirect("/api/refresh-session?redirect=/workspace/projects");
      }
      redirect("/api/clear-session");
   }

   return (
      <div className="ws-layout">
         <WorkspaceSidebar username={me.username} email={me.email} />
         <div className="ws-content">{children}</div>
      </div>
   );
}
