import Link from "next/link";
import { fetchProjectStatuses, fetchProjects } from "@/lib/api/client";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import type { Project, ProjectStatus, ProjectStatusMeta } from "@/lib/api/types";
import CreateProjectButton from "@/components/workspace/CreateProjectButton";
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
   search?: string;
   status?: string;
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
   const limit = 15;

   const [projectsResult, statusesResult] = await Promise.all([
      fetchProjects(token, {
         page,
         limit,
         search: search || undefined,
         status: status || undefined,
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

   const { items, pagination } = data;
   const totalPages = pagination.total_pages || 1;

   // Build URL helper for filter/pagination links
   function buildUrl(overrides: Partial<SearchParams>) {
      const p = new URLSearchParams();
      const merged = { page: String(page), search, status, ...overrides };
      if (merged.search) p.set("search", merged.search);
      if (merged.status) p.set("status", merged.status);
      if (Number(merged.page) > 1) p.set("page", merged.page!);
      const qs = p.toString();
      return `/workspace/projects${qs ? `?${qs}` : ""}`;
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
            <button type="submit" className="ws-btn-ghost">
               ค้นหา
            </button>
            {(search || status) && (
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
                     {search || status
                        ? "ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข"
                        : "ยังไม่มีโปรเจกต์"}
                  </div>
                  <div className="ws-empty-desc">
                     {search || status
                        ? "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง"
                        : 'กดปุ่ม "สร้างโปรเจกต์" เพื่อเริ่มต้น'}
                  </div>
               </div>
            ) : (
               <>
                  <table className="ws-table">
                     <thead>
                        <tr>
                           <th>รหัส</th>
                           <th>ชื่อโปรเจกต์</th>
                           <th>สถานะ</th>
                           <th>สร้างเมื่อ</th>
                           <th>อัปเดตล่าสุด</th>
                        </tr>
                     </thead>
                     <tbody>
                        {items.map((p: Project) => (
                           <tr key={p.id}>
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

                  {/* ─── Pagination ─── */}
                  {totalPages > 1 && (
                     <div className="ws-pagination">
                        <span>
                           หน้า {page} / {totalPages} (
                           {pagination.total_records} รายการ)
                        </span>
                        <div className="ws-pagination-links">
                           <Link
                              href={buildUrl({ page: String(page - 1) })}
                              className="ws-pagination-link"
                              aria-disabled={page <= 1}
                           >
                              ← ก่อนหน้า
                           </Link>
                           <Link
                              href={buildUrl({ page: String(page + 1) })}
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
