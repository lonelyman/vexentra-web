import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchDashboardStats } from "@/lib/api/client";
import type { ProjectStatus, DashboardStatusCount } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
   draft: "ร่าง",
   planned: "วางแผน",
   bidding: "ประมูล",
   active: "ดำเนินการ",
   on_hold: "พักงาน",
   closed: "ปิดงาน",
};

function formatAmount(s: string): string {
   const n = parseFloat(s);
   if (isNaN(n)) return s;
   return n.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   });
}

function formatDate(iso: string): string {
   return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });
}

function daysUntil(iso: string): number {
   const diff = new Date(iso).getTime() - Date.now();
   return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Status card colours ──────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
   draft: "var(--text-dim)",
   planned: "var(--accent)",
   bidding: "var(--gold)",
   active: "var(--teal)",
   on_hold: "#fb923c",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
   const token = (await cookies()).get("token")?.value;
   if (!token) redirect("/login");

   const { data: stats, status } = await fetchDashboardStats(token);

   if (!stats) {
      if (status === 401) redirect("/api/refresh-session?redirect=/workspace");
      redirect("/api/clear-session");
   }

   // Build a lookup map so we can display all non-closed statuses even when count = 0
   const countMap = new Map<string, number>(
      stats.status_counts.map((s: DashboardStatusCount) => [s.status, s.count]),
   );
   const displayStatuses: ProjectStatus[] = [
      "active",
      "bidding",
      "planned",
      "on_hold",
      "draft",
   ];

   const net = parseFloat(stats.pl.net);

   return (
      <main className="ws-page">
         <div className="ws-page-header">
            <div>
               <h1 className="ws-page-title">Dashboard</h1>
               <p className="ws-page-subtitle">ภาพรวมโปรเจกต์ที่คุณรับผิดชอบ</p>
            </div>
            <Link href="/workspace/projects" className="ws-btn-ghost">
               ดูโปรเจกต์ทั้งหมด →
            </Link>
         </div>

         {/* ─── Status counts ─── */}
         <div className="ws-summary-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {displayStatuses.map((s) => (
               <Link
                  key={s}
                  href={`/workspace/projects?status=${s}`}
                  style={{ textDecoration: "none" }}
               >
                  <div className="ws-summary-card" style={{ cursor: "pointer" }}>
                     <div className="ws-summary-label">{STATUS_LABEL[s]}</div>
                     <div
                        className="ws-summary-amount"
                        style={{ color: STATUS_COLOR[s] ?? "var(--text)" }}
                     >
                        {countMap.get(s) ?? 0}
                     </div>
                     <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                        โปรเจกต์
                     </div>
                  </div>
               </Link>
            ))}
         </div>

         {/* ─── P&L summary ─── */}
         <div style={{ marginBottom: 28 }}>
            <h2
               style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 14,
                  letterSpacing: "-0.2px",
               }}
            >
               รายรับ-จ่าย (โปรเจกต์ที่ยังไม่ปิด)
            </h2>
            <div className="ws-summary-grid">
               <div className="ws-summary-card">
                  <div className="ws-summary-label">รายรับรวม</div>
                  <div className="ws-summary-amount ws-summary-income">
                     ฿{formatAmount(stats.pl.income)}
                  </div>
               </div>
               <div className="ws-summary-card">
                  <div className="ws-summary-label">รายจ่ายรวม</div>
                  <div className="ws-summary-amount ws-summary-expense">
                     ฿{formatAmount(stats.pl.expense)}
                  </div>
               </div>
               <div className="ws-summary-card">
                  <div className="ws-summary-label">กำไร/ขาดทุนสุทธิ</div>
                  <div
                     className={`ws-summary-amount ${
                        net >= 0 ? "ws-summary-net-positive" : "ws-summary-net-negative"
                     }`}
                  >
                     ฿{formatAmount(stats.pl.net)}
                  </div>
               </div>
            </div>
         </div>

         {/* ─── Upcoming deadlines ─── */}
         <div>
            <h2
               style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 14,
                  letterSpacing: "-0.2px",
               }}
            >
               Deadline ใน 30 วันถัดไป
            </h2>

            {stats.upcoming_deadlines.length === 0 ? (
               <div className="ws-table-wrap">
                  <div className="ws-empty">
                     <div className="ws-empty-icon">🗓️</div>
                     <div className="ws-empty-title">ไม่มี Deadline ที่ใกล้จะถึง</div>
                     <div className="ws-empty-desc">
                        โปรเจกต์ทั้งหมดยังไม่มี deadline ใน 30 วันข้างหน้า
                     </div>
                  </div>
               </div>
            ) : (
               <div className="ws-table-wrap">
                  <table className="ws-table">
                     <thead>
                        <tr>
                           <th>รหัส</th>
                           <th>ชื่อโปรเจกต์</th>
                           <th>สถานะ</th>
                           <th>Deadline</th>
                           <th>เหลืออีก</th>
                        </tr>
                     </thead>
                     <tbody>
                        {stats.upcoming_deadlines.map((p) => {
                           const days = daysUntil(p.deadline_at);
                           const urgentColor =
                              days <= 7 ? "#f87171" : days <= 14 ? "var(--gold)" : "var(--teal)";
                           return (
                              <tr key={p.id}>
                                 <td>
                                    <Link
                                       href={`/workspace/projects/${p.project_code.toLowerCase()}`}
                                       style={{ textDecoration: "none" }}
                                    >
                                       <span className="ws-project-code">{p.project_code}</span>
                                    </Link>
                                 </td>
                                 <td>
                                    <Link
                                       href={`/workspace/projects/${p.project_code.toLowerCase()}`}
                                       style={{ textDecoration: "none" }}
                                    >
                                       <span className="ws-project-name">{p.name}</span>
                                    </Link>
                                 </td>
                                 <td>
                                    <span className={`ws-badge ws-badge-${p.status}`}>
                                       {STATUS_LABEL[p.status] ?? p.status}
                                    </span>
                                 </td>
                                 <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                    {formatDate(p.deadline_at)}
                                 </td>
                                 <td>
                                    <span
                                       style={{
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: urgentColor,
                                       }}
                                    >
                                       {days === 0
                                          ? "วันนี้!"
                                          : days < 0
                                          ? `เกิน ${Math.abs(days)} วัน`
                                          : `${days} วัน`}
                                    </span>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </main>
   );
}
