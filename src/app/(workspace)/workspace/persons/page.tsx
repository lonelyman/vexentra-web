import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import { fetchUsers, fetchMe } from "@/lib/api/client";
import { redirect } from "next/navigation";
import type { UserListItem } from "@/lib/api/types";
import Link from "next/link";
import CreateUserModal from "@/components/workspace/CreateUserModal";

export const metadata = { title: "พนักงานทั้งหมด — Vexentra" };

function formatDate(iso: string | null): string {
   if (!iso) return "—";
   return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

const STATUS_LABEL: Record<string, string> = {
   active: "ใช้งาน",
   inactive: "ระงับ",
   pending: "รอยืนยัน",
};

export default async function PersonsPage({
   searchParams,
}: {
   searchParams: Promise<{ page?: string }>;
}) {
   const token = await requireAuth("/workspace/persons");

   // Role guard — admin only
   const { data: me } = await fetchMe(token);
   if (!me || me.role !== "admin") redirect("/workspace");

   const sp = await searchParams;
   const page = Math.max(1, Number(sp.page) || 1);
   const limit = 20;

   const { data, status } = await fetchUsers(token, { page, limit });
   if (!data) handleAuthError(status, "/workspace/persons");

   const { items, pagination } = data!;

   return (
      <div className="ws-page">
         <div className="ws-page-header">
            <div>
               <h1 className="ws-page-title">
                  พนักงานทั้งหมด
                  <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-muted)", marginLeft: 10 }}>
                     {pagination.total_records} คน
                  </span>
               </h1>
               <p className="ws-page-subtitle">รายชื่อผู้ใช้งานทั้งหมดในระบบ</p>
            </div>
            <CreateUserModal />
         </div>

         <div className="ws-table-wrap">
            {items.length === 0 ? (
               <div className="ws-empty">
                  <div className="ws-empty-icon">👥</div>
                  <div className="ws-empty-title">ยังไม่มีผู้ใช้งาน</div>
               </div>
            ) : (
               <>
                  <table className="ws-table">
                     <thead>
                        <tr>
                           <th>ลำดับ</th>
                           <th>Username</th>
                           <th>Email</th>
                           <th>Role</th>
                           <th>สถานะ</th>
                           <th>ยืนยันอีเมล</th>
                           <th>เข้าใช้ล่าสุด</th>
                           <th>สมัครเมื่อ</th>
                           <th></th>
                        </tr>
                     </thead>
                     <tbody>
                        {items.map((u: UserListItem, index: number) => (
                           <tr key={u.id}>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                 {(page - 1) * limit + index + 1}
                              </td>
                              <td>
                                 <span style={{ fontWeight: 600, color: "var(--text)" }}>
                                    {u.username}
                                 </span>
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                 {u.email}
                              </td>
                              <td>
                                 <span
                                    className="ws-badge"
                                    style={{
                                       color: u.role === "admin" ? "var(--accent)" : u.role === "manager" ? "var(--gold)" : "var(--text-dim)",
                                       background: u.role === "admin" ? "rgba(59,130,246,0.1)" : u.role === "manager" ? "rgba(251,191,36,0.1)" : "var(--bg3)",
                                    }}
                                 >
                                    {u.role}
                                 </span>
                              </td>
                              <td>
                                 <span className={`ws-badge ${u.status === "active" ? "ws-badge-active" : u.status === "inactive" ? "ws-badge-closed" : "ws-badge-planned"}`}>
                                    {STATUS_LABEL[u.status] ?? u.status}
                                 </span>
                              </td>
                              <td>
                                 <span style={{ fontSize: 12, color: u.is_email_verified ? "var(--teal)" : "var(--gold)", fontWeight: 600 }}>
                                    {u.is_email_verified ? "✓ ยืนยันแล้ว" : "รอยืนยัน"}
                                 </span>
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                 {formatDate(u.last_login_at)}
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                 {formatDate(u.created_at)}
                              </td>
                              <td>
                                 <Link
                                    href={`/workspace/persons/${u.id}/edit`}
                                    className="ws-btn-ghost ws-btn-sm"
                                 >
                                    แก้ไข
                                 </Link>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  <div className="ws-pagination">
                     <span>
                        {pagination.total_records} คน · หน้า {page} / {pagination.total_pages}
                     </span>
                     <div className="ws-pagination-links">
                        <Link
                           href={`/workspace/persons?page=${page - 1}`}
                           className="ws-pagination-link"
                           aria-disabled={page <= 1 ? "true" : undefined}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                           </svg>
                        </Link>
                        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                           <Link
                              key={p}
                              href={`/workspace/persons?page=${p}`}
                              className="ws-pagination-link"
                              style={p === page ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}
                           >
                              {p}
                           </Link>
                        ))}
                        <Link
                           href={`/workspace/persons?page=${page + 1}`}
                           className="ws-pagination-link"
                           aria-disabled={page >= pagination.total_pages ? "true" : undefined}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                           </svg>
                        </Link>
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
