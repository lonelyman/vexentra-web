import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import AdminNav from "@/components/admin/AdminNav";
import "@/styles/admin.css";

export default async function AdminLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const token = (await cookies()).get("token")?.value;

   if (!token) {
      redirect("/login");
   }

   return (
      <div className="admin-layout">
         <header className="admin-topbar">
            <div className="admin-topbar-inner">
               <div className="admin-brand">
                  showcase<span className="dot">.</span>
                  <span className="admin-brand-tag">Admin</span>
               </div>

               <AdminNav />

               <form action={logoutAction} className="admin-logout-form">
                  <button type="submit" className="admin-logout-btn">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                     </svg>
                     ออกจากระบบ
                  </button>
               </form>
            </div>
         </header>

         <main className="admin-main">{children}</main>
      </div>
   );
}
