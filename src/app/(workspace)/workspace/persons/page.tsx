import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import { fetchUsers, fetchMe } from "@/lib/api/client";
import { redirect } from "next/navigation";
import type { UserListItem } from "@/lib/api/types";
import Link from "next/link";
import CreateUserModal from "@/components/workspace/CreateUserModal";
import Pagination from "@/components/workspace/Pagination";

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

const validLimits = [10, 20, 50, 100, 200, 500];
const DEFAULT_LIMIT = 20;

export default async function PersonsPage({
   searchParams,
}: {
   searchParams: Promise<{ page?: string; limit?: string }>;
}) {
   const token = await requireAuth("/workspace/persons");

   // Role guard — admin only
   const { data: me } = await fetchMe(token);
   if (!me || me.role !== "admin") redirect("/workspace");

   const sp = await searchParams;
   const page = Math.max(1, Number(sp.page) || 1);
   const limit = validLimits.includes(Number(sp.limit)) ? Number(sp.limit) : DEFAULT_LIMIT;

   const { data, status } = await fetchUsers(token, { page, limit });
   if (!data) handleAuthError(status, "/workspace/persons");

   const { items, pagination } = data!;
   const totalPages = pagination.total_pages || 1;

   if (page > totalPages) {
      const p = new URLSearchParams();
      if (limit !== DEFAULT_LIMIT) p.set("limit", String(limit));
      if (totalPages > 1) p.set("page", String(totalPages));
      const qs = p.toString();
      redirect(`/workspace/persons${qs ? `?${qs}` : ""}`);
   }

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
                  <div className="ws-table-scroll">
                  <table className="ws-table">
                     <thead>
                        <tr>
                           <th style={{ width: 48, textAlign: "center" }}>ลำดับ</th>
                           <th>Username</th>
                           <th>Email</th>
                           <th>Role</th>
                           <th>สถานะ</th>
                           <th style={{ minWidth: 120 }}>ยืนยันอีเมล</th>
                           <th style={{ minWidth: 140 }}>เข้าใช้ล่าสุด</th>
                           <th style={{ minWidth: 140 }}>สมัครเมื่อ</th>
                           <th style={{ width: 90, textAlign: "center" }}>เครื่องมือ</th>
                        </tr>
                     </thead>
                     <tbody>
                        {items.map((u: UserListItem, index: number) => (
                           <tr key={u.id}>
                              <td style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
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
                                 <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                    <Link
                                       href={`/portfolio/${u.person_id}`}
                                       className="ws-btn-ghost ws-btn-sm"
                                       target="_blank"
                                       rel="noreferrer"
                                    >
                                       ดู
                                    </Link>
                                    <Link
                                       href={`/workspace/persons/${u.id}/edit`}
                                       className="ws-btn-ghost ws-btn-sm"
                                    >
                                       แก้ไข
                                    </Link>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  </div>

                  <Pagination
                     page={page}
                     limit={limit}
                     totalPages={totalPages}
                     totalRecords={pagination.total_records}
                     unit="คน"
                     basePath="/workspace/persons"
                  />
               </>
            )}
         </div>
      </div>
   );
}
