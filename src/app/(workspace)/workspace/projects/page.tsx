import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchProjects } from "@/lib/api/client";
import type { Project, ProjectStatus } from "@/lib/api/types";
import CreateProjectButton from "@/components/workspace/CreateProjectButton";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
   draft: "ร่าง",
   planned: "วางแผน",
   bidding: "ประมูล",
   active: "ดำเนินการ",
   on_hold: "พักงาน",
   closed: "ปิดงาน",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
   { value: "", label: "ทุกสถานะ" },
   { value: "draft", label: "ร่าง" },
   { value: "planned", label: "วางแผน" },
   { value: "bidding", label: "ประมูล" },
   { value: "active", label: "ดำเนินการ" },
   { value: "on_hold", label: "พักงาน" },
   { value: "closed", label: "ปิดงาน" },
];

function StatusBadge({ status }: { status: ProjectStatus }) {
   return (
      <span className={`ws-badge ws-badge-${status}`}>
         {STATUS_LABEL[status] ?? status}
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
   const token = (await cookies()).get("token")?.value;
   if (!token) redirect("/login");

   const params = await searchParams;
   const page = Math.max(1, Number(params.page) || 1);
   const search = params.search?.trim() || "";
   const status = params.status || "";
   const limit = 15;

   const { data, status: httpStatus } = await fetchProjects(token, {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
   });

   if (!data) {
      if (httpStatus === 401) {
         redirect("/api/refresh-session?redirect=/workspace/projects");
      }
      redirect("/api/clear-session");
   }

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
               {STATUS_OPTIONS.map((opt) => (
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
                        : "กดปุ่ม \"สร้างโปรเจกต์\" เพื่อเริ่มต้น"}
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
                                    <div className="ws-project-name">{p.name}</div>
                                    {p.description && (
                                       <div className="ws-project-desc">
                                          {p.description}
                                       </div>
                                    )}
                                 </Link>
                              </td>
                              <td>
                                 <StatusBadge status={p.status} />
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
                                 {formatDate(p.created_at)}
                              </td>
                              <td style={{ color: "var(--text-dim)", fontSize: 13 }}>
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
