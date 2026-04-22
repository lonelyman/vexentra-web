import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
   fetchProjectByCode,
   fetchTransactions,
   fetchTransactionSummary,
   fetchMembers,
   fetchTxCategories,
} from "@/lib/api/client";
import type { ProjectStatus, Transaction, Member } from "@/lib/api/types";
import CreateTransactionModal from "@/components/workspace/CreateTransactionModal";
import AddMemberModal from "@/components/workspace/AddMemberModal";
import MemberRemoveButton from "@/components/workspace/MemberActions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
   draft: "ร่าง",
   planned: "วางแผน",
   bidding: "ประมูล",
   active: "ดำเนินการ",
   on_hold: "พักงาน",
   closed: "ปิดงาน",
};

function StatusBadge({ status }: { status: ProjectStatus }) {
   return (
      <span className={`ws-badge ws-badge-${status}`}>
         {STATUS_LABEL[status] ?? status}
      </span>
   );
}

function formatDate(iso: string | null | undefined): string {
   if (!iso) return "—";
   return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });
}

function formatAmount(amount: string): string {
   const n = parseFloat(amount);
   if (isNaN(n)) return amount;
   return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type Tab = "overview" | "transactions" | "members";
const TABS: { id: Tab; label: string }[] = [
   { id: "overview", label: "ภาพรวม" },
   { id: "transactions", label: "รายการรับ-จ่าย" },
   { id: "members", label: "สมาชิก" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
   params: Promise<{ code: string }>;
   searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function ProjectDetailPage({
   params,
   searchParams,
}: PageProps) {
   const token = (await cookies()).get("token")?.value;
   if (!token) redirect("/login");

   const { code } = await params;
   const sp = await searchParams;
   const tab = (sp.tab as Tab) ?? "overview";
   const page = Math.max(1, Number(sp.page) || 1);
   const limit = 20;

   // Always fetch the project
   const { data: project, status: pStatus } = await fetchProjectByCode(token, code);
   if (pStatus === 401) redirect("/api/refresh-session?redirect=/workspace/projects");
   if (pStatus === 404 || !project) notFound();
   if (pStatus === 403) redirect("/workspace/projects");

   const isClosed = project.status === "closed";

   function tabUrl(t: Tab) {
      return `/workspace/projects/${code}?tab=${t}`;
   }

   // ─── Overview Tab ─────────────────────────────────────────────────────────

   if (tab === "overview") {
      return (
         <main className="ws-page">
            <Link href="/workspace/projects" className="ws-back-link">
               ← กลับรายการโปรเจกต์
            </Link>

            <div className="ws-page-header">
               <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                     <span className="ws-project-code">{project.project_code}</span>
                     <StatusBadge status={project.status} />
                  </div>
                  <h1 className="ws-page-title">{project.name}</h1>
               </div>
            </div>

            <nav className="ws-tabs">
               {TABS.map((t) => (
                  <Link
                     key={t.id}
                     href={tabUrl(t.id)}
                     className={`ws-tab ${tab === t.id ? "active" : ""}`}
                  >
                     {t.label}
                  </Link>
               ))}
            </nav>

            <div className="ws-detail-grid">
               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">สถานะ</div>
                  <div className="ws-detail-field-value">
                     <StatusBadge status={project.status} />
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">ลูกค้า</div>
                  <div className={`ws-detail-field-value ${!project.client_name_raw && !project.client_person_id ? "muted" : ""}`}>
                     {project.client_name_raw || (project.client_person_id ? project.client_person_id : "ยังไม่ระบุ")}
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">วันที่เริ่มต้นที่วางแผน</div>
                  <div className="ws-detail-field-value">
                     {formatDate(project.scheduled_start_at)}
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">กำหนดส่งงาน</div>
                  <div className="ws-detail-field-value">
                     {formatDate(project.deadline_at)}
                  </div>
               </div>

               {project.activated_at && (
                  <div className="ws-detail-card">
                     <div className="ws-detail-field-label">เริ่มดำเนินการ</div>
                     <div className="ws-detail-field-value">
                        {formatDate(project.activated_at)}
                     </div>
                  </div>
               )}

               {project.closed_at && (
                  <div className="ws-detail-card">
                     <div className="ws-detail-field-label">ปิดงานเมื่อ</div>
                     <div className="ws-detail-field-value">
                        {formatDate(project.closed_at)}
                     </div>
                  </div>
               )}

               {project.closure_reason && (
                  <div className="ws-detail-card">
                     <div className="ws-detail-field-label">เหตุผลปิดงาน</div>
                     <div className="ws-detail-field-value">{project.closure_reason}</div>
                  </div>
               )}

               {project.description && (
                  <div className="ws-detail-card ws-detail-card-full">
                     <div className="ws-detail-field-label">รายละเอียด</div>
                     <div className="ws-detail-field-value" style={{ whiteSpace: "pre-wrap" }}>
                        {project.description}
                     </div>
                  </div>
               )}

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">สร้างเมื่อ</div>
                  <div className="ws-detail-field-value">{formatDate(project.created_at)}</div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">อัปเดตล่าสุด</div>
                  <div className="ws-detail-field-value">{formatDate(project.updated_at)}</div>
               </div>
            </div>
         </main>
      );
   }

   // ─── Transactions Tab ─────────────────────────────────────────────────────

   if (tab === "transactions") {
      const [txResult, summaryResult, catResult] = await Promise.all([
         fetchTransactions(token, project.id, { page, limit }),
         fetchTransactionSummary(token, project.id),
         fetchTxCategories(token),
      ]);

      const txData = txResult.data;
      const summary = summaryResult.data;
      const categories = catResult.data ?? [];

      const transactions = txData?.items ?? [];
      const pagination = txData?.pagination;
      const totalPages = pagination?.total_pages ?? 1;

      // Build category lookup for display
      const catMap = new Map(categories.map((c) => [c.id, c]));

      const net = summary ? parseFloat(summary.net) : 0;

      return (
         <main className="ws-page">
            <Link href="/workspace/projects" className="ws-back-link">
               ← กลับรายการโปรเจกต์
            </Link>

            <div className="ws-page-header">
               <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                     <span className="ws-project-code">{project.project_code}</span>
                     <StatusBadge status={project.status} />
                  </div>
                  <h1 className="ws-page-title">{project.name}</h1>
               </div>
            </div>

            <nav className="ws-tabs">
               {TABS.map((t) => (
                  <Link
                     key={t.id}
                     href={tabUrl(t.id)}
                     className={`ws-tab ${tab === t.id ? "active" : ""}`}
                  >
                     {t.label}
                  </Link>
               ))}
            </nav>

            {/* Summary cards */}
            {summary && (
               <div className="ws-summary-grid">
                  <div className="ws-summary-card">
                     <div className="ws-summary-label">รายรับ</div>
                     <div className="ws-summary-amount ws-summary-income">
                        ฿{formatAmount(summary.income)}
                     </div>
                  </div>
                  <div className="ws-summary-card">
                     <div className="ws-summary-label">รายจ่าย</div>
                     <div className="ws-summary-amount ws-summary-expense">
                        ฿{formatAmount(summary.expense)}
                     </div>
                  </div>
                  <div className="ws-summary-card">
                     <div className="ws-summary-label">คงเหลือ (สุทธิ)</div>
                     <div
                        className={`ws-summary-amount ${
                           net >= 0 ? "ws-summary-net-positive" : "ws-summary-net-negative"
                        }`}
                     >
                        ฿{formatAmount(summary.net)}
                     </div>
                  </div>
               </div>
            )}

            {/* Table header + actions */}
            <div className="ws-page-header" style={{ marginBottom: 16 }}>
               <p className="ws-page-subtitle">
                  {pagination?.total_records ?? 0} รายการ
               </p>
               <div style={{ display: "flex", gap: 8 }}>
                  <a
                     href={`/workspace/projects/${code}/export`}
                     className="ws-btn-ghost"
                     download
                  >
                     ↓ Export CSV
                  </a>
                  <CreateTransactionModal
                     projectId={project.id}
                     categories={categories}
                     disabled={isClosed}
                  />
               </div>
            </div>

            <div className="ws-table-wrap">
               {transactions.length === 0 ? (
                  <div className="ws-empty">
                     <div className="ws-empty-icon">💰</div>
                     <div className="ws-empty-title">ยังไม่มีรายการรับ-จ่าย</div>
                     <div className="ws-empty-desc">
                        {isClosed
                           ? "โปรเจกต์ปิดแล้ว ไม่สามารถเพิ่มรายการได้"
                           : "กดปุ่ม \"เพิ่มรายการ\" เพื่อบันทึกรายการแรก"}
                     </div>
                  </div>
               ) : (
                  <>
                     <table className="ws-table">
                        <thead>
                           <tr>
                              <th>วันที่</th>
                              <th>ประเภท</th>
                              <th>หมายเหตุ</th>
                              <th style={{ textAlign: "right" }}>จำนวนเงิน</th>
                           </tr>
                        </thead>
                        <tbody>
                           {transactions.map((tx: Transaction) => {
                              const cat = catMap.get(tx.category_id);
                              const isIncome = cat?.type === "income";
                              return (
                                 <tr key={tx.id}>
                                    <td style={{ color: "var(--text-dim)", fontSize: 13, whiteSpace: "nowrap" }}>
                                       {formatDate(tx.occurred_at)}
                                    </td>
                                    <td>
                                       {cat ? (
                                          <span style={{ fontSize: 13 }}>{cat.name}</span>
                                       ) : (
                                          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                                             {tx.category_id.slice(0, 8)}…
                                          </span>
                                       )}
                                    </td>
                                    <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                       {tx.note || "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                       <span
                                          className={
                                             isIncome ? "ws-amount-income" : "ws-amount-expense"
                                          }
                                       >
                                          {isIncome ? "+" : "-"}฿{formatAmount(tx.amount)}
                                       </span>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>

                     {totalPages > 1 && (
                        <div className="ws-pagination">
                           <span>
                              หน้า {page} / {totalPages}
                           </span>
                           <div className="ws-pagination-links">
                              <Link
                                 href={`${tabUrl("transactions")}&page=${page - 1}`}
                                 className="ws-pagination-link"
                                 aria-disabled={page <= 1}
                              >
                                 ← ก่อนหน้า
                              </Link>
                              <Link
                                 href={`${tabUrl("transactions")}&page=${page + 1}`}
                                 className="ws-pagination-link"
                                 aria-disabled={page >= totalPages}
                              >
                                 ถัดไป →
                              </Link>
                           </div>
                        </div>
                     )}
                  </>
               )}
            </div>
         </main>
      );
   }

   // ─── Members Tab ──────────────────────────────────────────────────────────

   const { data: membersData } = await fetchMembers(token, project.id);
   const members = membersData ?? [];

   return (
      <main className="ws-page">
         <Link href="/workspace/projects" className="ws-back-link">
            ← กลับรายการโปรเจกต์
         </Link>

         <div className="ws-page-header">
            <div>
               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span className="ws-project-code">{project.project_code}</span>
                  <StatusBadge status={project.status} />
               </div>
               <h1 className="ws-page-title">{project.name}</h1>
            </div>
         </div>

         <nav className="ws-tabs">
            {TABS.map((t) => (
               <Link
                  key={t.id}
                  href={tabUrl(t.id)}
                  className={`ws-tab ${tab === t.id ? "active" : ""}`}
               >
                  {t.label}
               </Link>
            ))}
         </nav>

         <div className="ws-page-header" style={{ marginBottom: 16 }}>
            <p className="ws-page-subtitle">{members.length} สมาชิก</p>
            <AddMemberModal projectId={project.id} />
         </div>

         <div className="ws-member-list">
            {members.length === 0 ? (
               <div className="ws-empty">
                  <div className="ws-empty-icon">👥</div>
                  <div className="ws-empty-title">ยังไม่มีสมาชิก</div>
                  <div className="ws-empty-desc">กดปุ่ม &quot;เพิ่มสมาชิก&quot; เพื่อเพิ่มคนเข้าทีม</div>
               </div>
            ) : (
               members.map((m: Member) => (
                  <div key={m.id} className="ws-member-row">
                     <div className="ws-member-avatar">
                        {m.person_id.slice(0, 1).toUpperCase()}
                     </div>
                     <div className="ws-member-info">
                        <div className="ws-member-badges">
                           {m.is_lead && (
                              <span className="ws-lead-badge">LEAD</span>
                           )}
                        </div>
                        <div className="ws-member-id">{m.person_id}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                           เข้าร่วม {formatDate(m.joined_at)}
                        </div>
                     </div>
                     <div className="ws-member-actions">
                        <MemberRemoveButton projectId={project.id} member={m} />
                     </div>
                  </div>
               ))
            )}
         </div>
      </main>
   );
}
