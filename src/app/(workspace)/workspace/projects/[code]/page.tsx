import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import {
   fetchMe,
   fetchPersonProfile,
   fetchProjectByCode,
   fetchProjectStatuses,
   fetchTransactions,
   fetchTransactionSummary,
   fetchMembers,
   fetchTxCategories,
   fetchTasks,
   fetchProjectFinancialPlan,
   fetchUsersCursor,
} from "@/lib/api/client";
import type {
   ProjectStatus,
   ProjectStatusMeta,
   Transaction,
   Member,
   Task,
   TaskStatus,
} from "@/lib/api/types";
import CreateTransactionModal from "@/components/workspace/CreateTransactionModal";
import AddMemberModal from "@/components/workspace/AddMemberModal";
import type { MemberPickerOption } from "@/components/workspace/AddMemberModal";
import MemberRemoveButton from "@/components/workspace/MemberActions";
import TransferLeadModal from "@/components/workspace/TransferLeadModal";
import CreateTaskModal from "@/components/workspace/CreateTaskModal";
import TaskCard from "@/components/workspace/TaskCard";
import UpdateProjectStatusModal from "@/components/workspace/UpdateProjectStatusModal";
import TransactionRowActions from "@/components/workspace/TransactionRowActions";
import ProjectFinancialPlanEditor from "@/components/workspace/ProjectFinancialPlanEditor";
import ProjectSettingsForm from "@/components/workspace/ProjectSettingsForm";
import {
   buildProjectStatusLabelMap,
   FALLBACK_PROJECT_STATUSES,
} from "@/lib/project-status";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({
   status,
   labels,
}: {
   status: ProjectStatus;
   labels: Record<ProjectStatus, string>;
}) {
   return (
      <span className={`ws-badge ws-badge-${status}`}>
         {labels[status] ?? status}
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
   return n.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   });
}

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type Tab =
   | "overview"
   | "financial_plan"
   | "transactions"
   | "members"
   | "tasks"
   | "settings";
const TABS: { id: Tab; label: string }[] = [
   { id: "overview", label: "ภาพรวม" },
   { id: "financial_plan", label: "ค่าจ้าง/งวดรับเงิน" },
   { id: "tasks", label: "งาน" },
   { id: "transactions", label: "รายการรับ-จ่าย" },
   { id: "members", label: "สมาชิก" },
   { id: "settings", label: "Project Settings" },
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
   const token = await requireAuth("/workspace/projects");

   const { code } = await params;
   const sp = await searchParams;
   const tab = (sp.tab as Tab) ?? "overview";
   const page = Math.max(1, Number(sp.page) || 1);
   const limit = 20;

   const [projectResult, statusResult, meResult] = await Promise.all([
      fetchProjectByCode(token, code),
      fetchProjectStatuses(token, { activeOnly: true }),
      fetchMe(token),
   ]);

   // Always fetch the project
   const { data: project, status: pStatus } = projectResult;
   if (pStatus === 401) handleAuthError(401, "/workspace/projects");
   if (pStatus === 404 || !project) notFound();
   if (pStatus === 403) handleAuthError(403, "/workspace/projects");
   const { data: me, status: meStatus } = meResult;
   if (!me) handleAuthError(meStatus, "/workspace/projects");
   const membersResult = await fetchMembers(token, project.id);
   const members = membersResult.data ?? [];

   const statusItems = statusResult.data ?? FALLBACK_PROJECT_STATUSES;
   const statusLabelMap = buildProjectStatusLabelMap(statusItems);
   const openStatusOptions = statusItems
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s: ProjectStatusMeta) => ({
         value: s.status as ProjectStatus,
         label: s.label_th,
      }));

   const isClosed = project.status === "closed";
   const isStaff = me.role === "admin" || me.role === "manager";
   const myMember = members.find((m) => m.person_id === me.person_id) ?? null;
   const isLead = Boolean(myMember?.is_lead);
   const isCoordinator =
      myMember?.roles?.some((role) => role.code === "coordinator") ?? false;
   const canManageProject = isStaff || isLead || isCoordinator;
   const canManageWhenOpen = canManageProject && (!isClosed || isStaff);
   const canManageMembers = canManageProject;
   const canManageTasks = canManageProject;

   const canReadByVisibility = (
      visibility: "all_members" | "lead_coordinator_staff" | "staff_only",
   ) => {
      if (visibility === "all_members") return true;
      if (visibility === "lead_coordinator_staff") {
         return isStaff || isLead || isCoordinator;
      }
      return isStaff;
   };
   const canReadContractFinance = canReadByVisibility(
      project.contract_finance_visibility,
   );
   const canReadExpenseFinance = canReadByVisibility(
      project.expense_finance_visibility,
   );

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
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                     }}
                  >
                     <span className="ws-project-code">
                        {project.project_code}
                     </span>
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
                  </div>
                  <h1 className="ws-page-title">{project.name}</h1>
               </div>
               {canManageProject && (
                  <UpdateProjectStatusModal
                     project={project}
                     options={openStatusOptions}
                     canEditClosedStatus={me.role === "admin"}
                  />
               )}
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

            {!canManageProject && (
               <div className="ws-empty" style={{ marginBottom: 16 }}>
                  <div className="ws-empty-title">สิทธิ์ของคุณ: สมาชิก (อ่านอย่างเดียว)</div>
                  <div className="ws-empty-desc">
                     โปรเจกต์นี้แก้ไขได้เฉพาะ Lead, Coordinator หรือ Staff เท่านั้น
                  </div>
               </div>
            )}

            <div className="ws-detail-grid">
               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">สถานะ</div>
                  <div className="ws-detail-field-value">
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">ประเภทโครงการ</div>
                  <div className="ws-detail-field-value">
                     {project.project_kind === "internal_continuous"
                        ? "งานภายในต่อเนื่อง"
                        : "งานลูกค้า"}
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">ลูกค้า</div>
                  <div
                     className={`ws-detail-field-value ${!project.client_name_raw && !project.client_person_id ? "muted" : ""}`}
                  >
                     {project.client_name_raw ||
                        (project.client_person_id
                           ? project.client_person_id
                           : "ยังไม่ระบุ")}
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">
                     วันที่เริ่มต้นที่วางแผน
                  </div>
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
                     <div className="ws-detail-field-value">
                        {project.closure_reason}
                     </div>
                  </div>
               )}

               {project.description && (
                  <div className="ws-detail-card ws-detail-card-full">
                     <div className="ws-detail-field-label">รายละเอียด</div>
                     <div
                        className="ws-detail-field-value"
                        style={{ whiteSpace: "pre-wrap" }}
                     >
                        {project.description}
                     </div>
                  </div>
               )}

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">สร้างเมื่อ</div>
                  <div className="ws-detail-field-value">
                     {formatDate(project.created_at)}
                  </div>
               </div>

               <div className="ws-detail-card">
                  <div className="ws-detail-field-label">อัปเดตล่าสุด</div>
                  <div className="ws-detail-field-value">
                     {formatDate(project.updated_at)}
                  </div>
               </div>
            </div>
         </main>
      );
   }

   if (tab === "financial_plan") {
      const planResult = canReadContractFinance
         ? await fetchProjectFinancialPlan(token, project.id)
         : { data: null, status: 403 };
      const planData = planResult.data;

      return (
         <main className="ws-page">
            <Link href="/workspace/projects" className="ws-back-link">
               ← กลับรายการโปรเจกต์
            </Link>

            <div className="ws-page-header">
               <div>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                     }}
                  >
                     <span className="ws-project-code">
                        {project.project_code}
                     </span>
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
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

            {!canReadContractFinance ? (
               <div className="ws-empty">
                  <div className="ws-empty-title">ไม่มีสิทธิ์ดูข้อมูลค่าจ้าง</div>
                  <div className="ws-empty-desc">
                     กติกาโปรเจกต์กำหนดให้ข้อมูลส่วนว่าจ้างดูได้เฉพาะบางบทบาท
                  </div>
               </div>
            ) : (
               <>
                  {!canManageWhenOpen && (
                     <div className="ws-empty" style={{ marginBottom: 12 }}>
                        <div className="ws-empty-title">โหมดอ่านอย่างเดียว</div>
                        <div className="ws-empty-desc">
                           คุณดูแผนค่าจ้างได้ แต่ไม่สามารถแก้ไขได้ตามสิทธิ์ปัจจุบัน
                        </div>
                     </div>
                  )}
                  <ProjectFinancialPlanEditor
                     projectId={project.id}
                     projectCode={project.project_code}
                     projectKind={project.project_kind}
                     initialPlan={planData}
                     canEdit={canManageWhenOpen}
                  />
               </>
            )}
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
      const allCategories = catResult.data ?? [];
      const categories = canReadExpenseFinance
         ? allCategories
         : allCategories.filter((cat) => cat.type === "income");

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
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                     }}
                  >
                     <span className="ws-project-code">
                        {project.project_code}
                     </span>
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
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

            {!canReadExpenseFinance && (
               <div className="ws-empty" style={{ marginBottom: 12 }}>
                  <div className="ws-empty-title">แสดงเฉพาะส่วนที่มีสิทธิ์</div>
                  <div className="ws-empty-desc">
                     คุณไม่มีสิทธิ์ดูข้อมูลค่าใช้จ่าย จึงเห็นเฉพาะรายการรายรับ
                  </div>
               </div>
            )}

            {!canManageWhenOpen && (
               <div className="ws-empty" style={{ marginBottom: 12 }}>
                  <div className="ws-empty-title">โหมดอ่านอย่างเดียว</div>
                  <div className="ws-empty-desc">
                     คุณสามารถดูรายการได้ แต่ไม่สามารถเพิ่ม/แก้ไข/ลบธุรกรรม
                  </div>
               </div>
            )}

            {/* Summary cards */}
            {summary && (
               <div className="ws-summary-grid">
                  <div className="ws-summary-card">
                     <div className="ws-summary-label">รายรับ</div>
                     <div className="ws-summary-amount ws-summary-income">
                        ฿{formatAmount(summary.income)}
                     </div>
                  </div>
                  {canReadExpenseFinance && (
                     <div className="ws-summary-card">
                        <div className="ws-summary-label">รายจ่าย</div>
                        <div className="ws-summary-amount ws-summary-expense">
                           ฿{formatAmount(summary.expense)}
                        </div>
                     </div>
                  )}
                  <div className="ws-summary-card">
                     <div className="ws-summary-label">
                        {canReadExpenseFinance ? "คงเหลือ (สุทธิ)" : "คงเหลือ (เฉพาะที่เห็น)"}
                     </div>
                     <div
                        className={`ws-summary-amount ${
                           net >= 0
                              ? "ws-summary-net-positive"
                              : "ws-summary-net-negative"
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
                  {canManageWhenOpen && (
                     <CreateTransactionModal
                        projectId={project.id}
                        categories={categories}
                        disabled={false}
                     />
                  )}
               </div>
            </div>

            <div className="ws-table-wrap">
               {transactions.length === 0 ? (
                  <div className="ws-empty">
                     <div className="ws-empty-icon">💰</div>
                     <div className="ws-empty-title">
                        ยังไม่มีรายการรับ-จ่าย
                     </div>
                     <div className="ws-empty-desc">
                        {isClosed
                           ? "โปรเจกต์ปิดแล้ว ไม่สามารถเพิ่มรายการได้"
                           : 'กดปุ่ม "เพิ่มรายการ" เพื่อบันทึกรายการแรก'}
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
                              <th style={{ textAlign: "right" }}>จัดการ</th>
                           </tr>
                        </thead>
                        <tbody>
                           {transactions.map((tx: Transaction) => {
                              const cat = catMap.get(tx.category_id);
                              const isIncome = cat?.type === "income";
                              return (
                                 <tr key={tx.id}>
                                    <td
                                       style={{
                                          color: "var(--text-dim)",
                                          fontSize: 13,
                                          whiteSpace: "nowrap",
                                       }}
                                    >
                                       {formatDate(tx.occurred_at)}
                                    </td>
                                    <td>
                                       {cat ? (
                                          <span style={{ fontSize: 13 }}>
                                             {cat.name}
                                          </span>
                                       ) : (
                                          <span
                                             style={{
                                                fontSize: 12,
                                                color: "var(--text-dim)",
                                             }}
                                          >
                                             {tx.category_id.slice(0, 8)}…
                                          </span>
                                       )}
                                    </td>
                                    <td
                                       style={{
                                          color: "var(--text-dim)",
                                          fontSize: 13,
                                       }}
                                    >
                                       {tx.note || "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                       <span
                                          className={
                                             isIncome
                                                ? "ws-amount-income"
                                                : "ws-amount-expense"
                                          }
                                       >
                                          {isIncome ? "+" : "-"}฿
                                          {formatAmount(tx.amount)}
                                       </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                       {canManageWhenOpen ? (
                                          <TransactionRowActions
                                             projectId={project.id}
                                             tx={tx}
                                             categories={categories}
                                             disabled={false}
                                          />
                                       ) : (
                                          <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>
                                       )}
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

   // ─── Tasks Tab ────────────────────────────────────────────────────────────

   if (tab === "tasks") {
      const { data: taskData } = await fetchTasks(token, project.id, {
         limit: 100,
      });
      const tasks = taskData?.items ?? [];

      const STATUS_ORDER: TaskStatus[] = [
         "in_progress",
         "todo",
         "done",
         "cancelled",
      ];
      const STATUS_LABEL_MAP: Record<TaskStatus, string> = {
         in_progress: "กำลังทำ",
         todo: "ยังไม่เริ่ม",
         done: "เสร็จแล้ว",
         cancelled: "ยกเลิก",
      };

      // Group tasks by status
      const grouped = STATUS_ORDER.reduce<Record<string, Task[]>>((acc, s) => {
         acc[s] = tasks.filter((t: Task) => t.status === s);
         return acc;
      }, {});

      const activeTasks = tasks.filter(
         (t: Task) => t.status !== "done" && t.status !== "cancelled",
      ).length;

      return (
         <main className="ws-page">
            <Link href="/workspace/projects" className="ws-back-link">
               ← กลับรายการโปรเจกต์
            </Link>
            <div className="ws-page-header">
               <div>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                     }}
                  >
                     <span className="ws-project-code">
                        {project.project_code}
                     </span>
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
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

            {!canManageTasks && (
               <div className="ws-empty" style={{ marginBottom: 12 }}>
                  <div className="ws-empty-title">โหมดอ่านอย่างเดียว</div>
                  <div className="ws-empty-desc">
                     คุณดูงานได้ แต่ไม่สามารถสร้าง แก้ไข หรือลบงาน
                  </div>
               </div>
            )}

            <div className="ws-page-header" style={{ marginBottom: 20 }}>
               <p className="ws-page-subtitle">
                  {tasks.length} งาน · {activeTasks} รายการที่ยังค้างอยู่
               </p>
               {canManageTasks && <CreateTaskModal projectId={project.id} />}
            </div>

            {tasks.length === 0 ? (
               <div className="ws-table-wrap">
                  <div className="ws-empty">
                     <div className="ws-empty-icon">✅</div>
                     <div className="ws-empty-title">ยังไม่มีงาน</div>
                     <div className="ws-empty-desc">
                        กดปุ่ม &quot;สร้างงาน&quot; เพื่อเพิ่มงานแรก
                     </div>
                  </div>
               </div>
            ) : (
               STATUS_ORDER.map((status) => {
                  const group = grouped[status];
                  if (group.length === 0) return null;
                  return (
                     <div key={status} className="ws-task-group">
                        <div className="ws-task-group-header">
                           {STATUS_LABEL_MAP[status]}
                           <span className="ws-task-group-count">
                              {group.length}
                           </span>
                        </div>
                        <div className="ws-task-list">
                           {group.map((t: Task) => (
                              <TaskCard
                                 key={t.id}
                                 task={t}
                                 projectId={project.id}
                                 canEdit={canManageTasks}
                              />
                           ))}
                        </div>
                     </div>
                  );
               })
            )}
         </main>
      );
   }

   if (tab === "settings") {
      return (
         <main className="ws-page">
            <Link href="/workspace/projects" className="ws-back-link">
               ← กลับรายการโปรเจกต์
            </Link>

            <div className="ws-page-header">
               <div>
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                     }}
                  >
                     <span className="ws-project-code">
                        {project.project_code}
                     </span>
                     <StatusBadge
                        status={project.status}
                        labels={statusLabelMap}
                     />
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

            <div className="ws-empty" style={{ marginBottom: 12 }}>
               <div className="ws-empty-title">คำอธิบายกติกาสิทธิ์การเงิน</div>
               <div className="ws-empty-desc">
                  ส่วนว่าจ้างและค่าใช้จ่ายแยกสิทธิ์กันได้: สมาชิกทุกคน / Lead-Coordinator-Staff / Staff เท่านั้น
               </div>
            </div>

            <ProjectSettingsForm
               project={project}
               canEdit={canManageWhenOpen}
            />
         </main>
      );
   }

   // ─── Members Tab ──────────────────────────────────────────────────────────
   const { data: usersData } = await fetchUsersCursor(token, {
      cursor: "",
      limit: 20,
      status: "active",
   });
   const activeUsers = usersData?.items ?? [];

   const candidateProfiles = await Promise.all(
      activeUsers.map(async (u) => {
         const { data: fullProfile } = await fetchPersonProfile(token, u.person_id);
         return {
            person_id: u.person_id,
            username: u.username,
            email: u.email,
            display_name: fullProfile?.profile?.display_name || u.username,
            headline: fullProfile?.profile?.headline || "",
            avatar_url: fullProfile?.profile?.avatar_url || "",
         } satisfies MemberPickerOption;
      }),
   );

   const memberInfoByPersonId = new Map(
      candidateProfiles.map((c) => [c.person_id, c] as const),
   );
   const missingMemberPersonIds = members
      .map((m) => m.person_id)
      .filter((personId) => !memberInfoByPersonId.has(personId));

   if (missingMemberPersonIds.length > 0) {
      const missingProfiles = await Promise.all(
         missingMemberPersonIds.map(async (personId) => {
            const { data: fullProfile } = await fetchPersonProfile(token, personId);
            return {
               person_id: personId,
               username: personId.slice(0, 8),
               email: "",
               display_name: fullProfile?.profile?.display_name || personId.slice(0, 8),
               headline: fullProfile?.profile?.headline || "",
               avatar_url: fullProfile?.profile?.avatar_url || "",
            } satisfies MemberPickerOption;
         }),
      );
      for (const p of missingProfiles) {
         memberInfoByPersonId.set(p.person_id, p);
      }
   }

   return (
      <main className="ws-page">
         <Link href="/workspace/projects" className="ws-back-link">
            ← กลับรายการโปรเจกต์
         </Link>

         <div className="ws-page-header">
            <div>
               <div
                  style={{
                     display: "flex",
                     alignItems: "center",
                     gap: 10,
                     marginBottom: 6,
                  }}
               >
                  <span className="ws-project-code">
                     {project.project_code}
                  </span>
                  <StatusBadge status={project.status} labels={statusLabelMap} />
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

         {!canManageMembers && (
            <div className="ws-empty" style={{ marginBottom: 12 }}>
               <div className="ws-empty-title">โหมดอ่านอย่างเดียว</div>
               <div className="ws-empty-desc">
                  คุณดูสมาชิกได้ แต่ไม่สามารถเพิ่ม ลบ หรือโอนสิทธิ์หัวหน้าทีม
               </div>
            </div>
         )}

         <div className="ws-page-header" style={{ marginBottom: 16 }}>
            <p className="ws-page-subtitle">{members.length} สมาชิก</p>
            {canManageMembers && (
               <AddMemberModal
                  projectId={project.id}
                  initialCandidates={candidateProfiles}
                  initialNextCursor={usersData?.pagination?.next_cursor ?? null}
                  initialHasMore={Boolean(usersData?.pagination?.has_more)}
                  existingPersonIds={members.map((m) => m.person_id)}
               />
            )}
         </div>

         <div className="ws-member-list">
            {members.length === 0 ? (
               <div className="ws-empty">
                  <div className="ws-empty-icon">👥</div>
                  <div className="ws-empty-title">ยังไม่มีสมาชิก</div>
                  <div className="ws-empty-desc">
                     กดปุ่ม &quot;เพิ่มสมาชิก&quot; เพื่อเพิ่มคนเข้าทีม
                  </div>
               </div>
            ) : (
               members.map((m: Member) => (
                  <div key={m.id} className="ws-member-row">
                     {(() => {
                        const info = memberInfoByPersonId.get(m.person_id);
                        const displayName = info?.display_name || m.person_id;
                        const initial = displayName.slice(0, 1).toUpperCase();
                        return (
                           <>
                              <div className="ws-member-avatar">
                                 {info?.avatar_url ? (
                                    <img
                                       src={info.avatar_url}
                                       alt={displayName}
                                       className="ws-member-avatar-img"
                                    />
                                 ) : (
                                    initial
                                 )}
                              </div>
                              <div className="ws-member-info">
                                 <div className="ws-member-badges">
                                    <div className="ws-member-name">{displayName}</div>
                                    {m.is_lead && (
                                       <span className="ws-lead-badge">LEAD</span>
                                    )}
                                 </div>
                                 {info?.headline ? (
                                    <div className="ws-member-headline">{info.headline}</div>
                                 ) : null}
                                 <div className="ws-member-id">{m.person_id}</div>
                                 <div
                                    style={{
                                       fontSize: 11,
                                       color: "var(--text-dim)",
                                       marginTop: 2,
                                    }}
                                 >
                                    เข้าร่วม {formatDate(m.joined_at)}
                                 </div>
                              </div>
                           </>
                        );
                     })()}
                     <div className="ws-member-actions">
                        {canManageMembers && m.is_lead ? (
                           <TransferLeadModal
                              projectId={project.id}
                              currentLeadLabel={memberInfoByPersonId.get(m.person_id)?.display_name || m.person_id}
                              candidates={members
                                 .filter((x) => x.person_id !== m.person_id)
                                 .map((x) => ({
                                    member_id: x.id,
                                    label: memberInfoByPersonId.get(x.person_id)?.display_name || x.person_id,
                                 }))}
                           />
                        ) : null}
                        {canManageMembers && (
                           <MemberRemoveButton
                              projectId={project.id}
                              member={m}
                              memberLabel={memberInfoByPersonId.get(m.person_id)?.display_name || m.person_id}
                           />
                        )}
                     </div>
                  </div>
               ))
            )}
         </div>
      </main>
   );
}
