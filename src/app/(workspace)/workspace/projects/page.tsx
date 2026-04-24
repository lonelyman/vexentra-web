import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchProjectStatuses, fetchProjects } from "@/lib/api/client";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import type { Project, ProjectStatus, ProjectStatusMeta } from "@/lib/api/types";
import CreateProjectButton from "@/components/workspace/CreateProjectButton";
import Pagination from "@/components/workspace/Pagination";
import {
   buildProjectStatusLabelMap,
   FALLBACK_PROJECT_STATUSES,
} from "@/lib/project-status";

// ─── Status helpers ───────────────────────────────────────────────────────────
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

function formatDate(iso: string | null): string {
   if (!iso) return "—";
   return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface SearchParams {
   page?: string;
   limit?: string;
   search?: string;
   status?: string;
   project_kind?: string;
}

export default async function ProjectsPage({
   searchParams,
}: {
   searchParams: Promise<SearchParams>;
}) {
   const token = await requireAuth("/workspace/projects");
   const params = await searchParams;
   const page = Math.max(1, Number(params.page) || 1);
   const search = params.search?.trim() || "";
   const status = params.status || "";
   const projectKind = params.project_kind || "";
   const validLimits = [10, 20, 50, 100, 200, 500];
   const DEFAULT_LIMIT = 20;
   const limit = validLimits.includes(Number(params.limit)) ? Number(params.limit) : DEFAULT_LIMIT;

   const [projectsResult, statusesResult] = await Promise.all([
      fetchProjects(token, {
         page,
         limit,
         search: search || undefined,
         status: status || undefined,
         project_kind: projectKind || undefined,
      }),
      fetchProjectStatuses(token, { activeOnly: true }),
   ]);

   const { data, status: httpStatus } = projectsResult;

   if (!data) handleAuthError(httpStatus, "/workspace/projects");

   const statusItems = statusesResult.data ?? FALLBACK_PROJECT_STATUSES;
   const statusLabels = buildProjectStatusLabelMap(statusItems);
   const statusOptions: { value: string; label: string }[] = [
      { value: "", label: "ทุกสถานะ" },
      ...statusItems
         .slice()
         .sort(
            (a: ProjectStatusMeta, b: ProjectStatusMeta) =>
               a.sort_order - b.sort_order,
         )
         .map((s: ProjectStatusMeta) => ({ value: s.status, label: s.label_th })),
   ];
   const projectKindOptions: { value: string; label: string }[] = [
      { value: "", label: "ทุกประเภทโครงการ" },
      { value: "client_delivery", label: "งานลูกค้า" },
      { value: "internal_continuous", label: "งานภายในต่อเนื่อง" },
   ];

   const { items, pagination } = data;
   const totalPages = pagination.total_pages || 1;

   if (page > totalPages) {
      const p = new URLSearchParams();
      if (search) p.set("search", search);
      if (status) p.set("status", status);
      if (projectKind) p.set("project_kind", projectKind);
      if (limit !== DEFAULT_LIMIT) p.set("limit", String(limit));
      if (totalPages > 1) p.set("page", String(totalPages));
      const qs = p.toString();
      redirect(`/workspace/projects${qs ? `?${qs}` : ""}`);
   }

   return (
      <main className="ws-page">
         {/* ─── Header ─── */}
         <div className="ws-page-header">
            <div>
               <h1 className="ws-page-title">โปรเจกต์</h1>
               <p className="ws-page-subtitle">
                  {pagination.total_records} โปรเจกต์ทั้งหมด
               </p>
            </div>
            <CreateProjectButton />
         </div>

         {/* ─── Toolbar ─── */}
         <form method="GET" action="/workspace/projects" className="ws-toolbar">
            <input
               type="text"
               name="search"
               defaultValue={search}
               placeholder="ค้นหาชื่อโปรเจกต์..."
               className="ws-search-input"
            />
            <select
               name="status"
               defaultValue={status}
               className="ws-filter-select"
            >
               {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </select>
            <select
               name="project_kind"
               defaultValue={projectKind}
               className="ws-filter-select"
            >
               {projectKindOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </select>
            <button type="submit" className="ws-btn-ghost">
               ค้นหา
            </button>
            {(search || status || projectKind) && (
               <Link href="/workspace/projects" className="ws-btn-ghost">
                  ล้างตัวกรอง
               </Link>
            )}
         </form>

         {/* ─── Table ─── */}
         <div className="ws-table-wrap">
            {items.length === 0 ? (
               <div className="ws-empty">
                  <div className="ws-empty-icon">📂</div>
                  <div className="ws-empty-title">
                     {search || status || projectKind
                        ? "ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข"
                        : "ยังไม่มีโปรเจกต์"}
                  </div>
                  <div className="ws-empty-desc">
                     {search || status || projectKind
                        ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง"
                        : 'กดปุ่ม "สร้างโปรเจกต์" เพื่อเริ่มต้น'}
                  </div>
               </div>
            ) : (
               <>
                  <div className="ws-table-scroll">
                  <table className="ws-table">
                     <thead>
                        <tr>
                           <th style={{ width: 48, textAlign: "center" }}>ลำดับ</th>
                           <th>รหัส</th>
                           <th>ชื่อโปรเจกต์</th>
                           <th>ประเภท</th>
                           <th>สถานะ</th>
                           <th style={{ minWidth: 130 }}>สร้างเมื่อ</th>
                           <th style={{ minWidth: 130 }}>อัปเดตล่าสุด</th>
                        </tr>
                     </thead>
                     <tbody>
                        {items.map((p: Project, idx: number) => (
                           <tr key={p.id}>
                              <td style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
                                 {(page - 1) * limit + idx + 1}
                              </td>
                              <td>
                                 <Link
                                    href={`/workspace/projects/${p.project_code.toLowerCase()}`}
                                    style={{ textDecoration: "none" }}
                                 >
                                    <span className="ws-project-code">
                                       {p.project_code}
                                    </span>
                                 </Link>
                              </td>
                              <td>
                                 <Link
                                    href={`/workspace/projects/${p.project_code.toLowerCase()}`}
                                    style={{ textDecoration: "none" }}
                                 >
                                    <div className="ws-project-name">
                                       {p.name}
                                    </div>
                                    {p.description && (
                                       <div className="ws-project-desc">
                                          {p.description}
                                       </div>
                                    )}
                                 </Link>
                              </td>
                              <td>
                                 <span className="ws-badge ws-badge-planned">
                                    {p.project_kind === "internal_continuous"
                                       ? "ภายใน"
                                       : "ลูกค้า"}
                                 </span>
                              </td>
                              <td>
                                 <StatusBadge
                                    status={p.status}
                                    labels={statusLabels}
                                 />
                              </td>
                              <td
                                 style={{
                                    color: "var(--text-dim)",
                                    fontSize: 13,
                                 }}
                              >
                                 {formatDate(p.created_at)}
                              </td>
                              <td
                                 style={{
                                    color: "var(--text-dim)",
                                    fontSize: 13,
                                 }}
                              >
                                 {formatDate(p.updated_at)}
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
                     unit="โปรเจกต์"
                     basePath="/workspace/projects"
                     extraParams={{ search, status, project_kind: projectKind }}
                  />
               </>
            )}
         </div>
      </main>
   );
}
