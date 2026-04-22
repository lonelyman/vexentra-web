"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface Props {
   username: string;
   email: string;
}

export default function WorkspaceSidebar({ username, email }: Props) {
   const pathname = usePathname();

   const initial = username.slice(0, 1).toUpperCase();

   return (
      <aside className="ws-sidebar">
         <div className="ws-sidebar-brand">
            <span className="ws-sidebar-brand-name">
               vex<span>entra</span>
            </span>
            <span className="ws-sidebar-brand-tag">Workspace</span>
         </div>

         <nav className="ws-sidebar-nav">
            <span className="ws-sidebar-section-label">ภาพรวม</span>
            <Link
               href="/workspace"
               className={`ws-nav-item ${pathname === "/workspace" ? "active" : ""}`}
            >
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
                     d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
               </svg>
               Dashboard
            </Link>

            <span className="ws-sidebar-section-label">โปรเจกต์</span>
            <Link
               href="/workspace/projects"
               className={`ws-nav-item ${pathname.startsWith("/workspace/projects") ? "active" : ""}`}
            >
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
                     d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
               </svg>
               โปรเจกต์ทั้งหมด
            </Link>

            <span className="ws-sidebar-section-label">บัญชี</span>
            <Link
               href="/admin"
               className={`ws-nav-item ${pathname === "/admin" ? "active" : ""}`}
            >
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
                     d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
               </svg>
               โปรไฟล์
            </Link>
         </nav>

         <div className="ws-sidebar-footer">
            <div className="ws-user-badge">
               <div className="ws-user-avatar">{initial}</div>
               <div className="ws-user-info">
                  <div className="ws-user-name">{username}</div>
                  <div className="ws-user-status">{email}</div>
               </div>
               <form action={logoutAction}>
                  <button type="submit" className="ws-logout-btn" title="ออกจากระบบ">
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
                  </button>
               </form>
            </div>
         </div>
      </aside>
   );
}
