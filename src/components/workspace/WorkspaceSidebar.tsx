"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface Props {
   username: string;
   email: string;
   role: string;
}

export default function WorkspaceSidebar({ username, email, role }: Props) {
   const pathname = usePathname();
   const initial = username.slice(0, 1).toUpperCase();
   const isAdmin = role === "admin";

   return (
      <aside className="ws-sidebar">
         {/* Brand */}
         <div className="ws-sidebar-brand">
            <span className="ws-sidebar-brand-name">
               vex<span>entra</span>
            </span>
            <span className="ws-sidebar-brand-tag">Workspace</span>
         </div>

         <nav className="ws-sidebar-nav">
            {/* ── ภาพรวม ── */}
            <span className="ws-sidebar-section-label">ภาพรวม</span>
            <Link
               href="/workspace"
               className={`ws-nav-item ${pathname === "/workspace" ? "active" : ""}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
               </svg>
               Dashboard
            </Link>

            {/* ── โปรเจกต์ ── */}
            <span className="ws-sidebar-section-label">โปรเจกต์</span>
            <Link
               href="/workspace/projects"
               className={`ws-nav-item ${pathname.startsWith("/workspace/projects") ? "active" : ""}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
               </svg>
               โปรเจกต์ทั้งหมด
            </Link>

            {/* ── จัดการระบบ (admin only) ── */}
            {isAdmin && (
               <>
                  <div className="ws-sidebar-divider" />
                  <span className="ws-sidebar-section-label">จัดการระบบ</span>
                  <Link
                     href="/workspace/persons"
                     className={`ws-nav-item ${pathname.startsWith("/workspace/persons") ? "active" : ""}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                     </svg>
                     พนักงานทั้งหมด
                  </Link>
               </>
            )}

            {/* ── บัญชี ── */}
            <div className="ws-sidebar-divider" />
            <span className="ws-sidebar-section-label">บัญชี</span>
            <Link
               href="/workspace/profile"
               className={`ws-nav-item ${pathname === "/workspace/profile" ? "active" : ""}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
               </svg>
               โปรไฟล์ & Portfolio
            </Link>

            <Link href="/" className="ws-nav-item" target="_blank" rel="noopener noreferrer">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
               </svg>
               ดูเว็บสาธารณะ
            </Link>
         </nav>

         {/* User badge */}
         <div className="ws-sidebar-footer">
            <div className="ws-user-badge">
               <div className="ws-user-avatar">{initial}</div>
               <div className="ws-user-info">
                  <div className="ws-user-name">{username}</div>
                  <div className="ws-user-status">{email}</div>
               </div>
               <form action={logoutAction}>
                  <button type="submit" className="ws-logout-btn" title="ออกจากระบบ">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                     </svg>
                  </button>
               </form>
            </div>
         </div>
      </aside>
   );
}
