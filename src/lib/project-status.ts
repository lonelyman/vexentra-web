import type { ProjectStatus, ProjectStatusMeta } from "@/lib/api/types";

export const FALLBACK_PROJECT_STATUSES: ProjectStatusMeta[] = [
   {
      status: "draft",
      label_th: "แบบร่าง",
      phase: "backlog",
      sort_order: 10,
      is_terminal: false,
      requires_client: false,
      is_active: true,
   },
   {
      status: "planned",
      label_th: "วางแผน",
      phase: "pre_sales",
      sort_order: 20,
      is_terminal: false,
      requires_client: false,
      is_active: true,
   },
   {
      status: "bidding",
      label_th: "ประมูล/เสนอราคา",
      phase: "pre_sales",
      sort_order: 30,
      is_terminal: false,
      requires_client: false,
      is_active: true,
   },
   {
      status: "active",
      label_th: "ดำเนินการ",
      phase: "delivery",
      sort_order: 40,
      is_terminal: false,
      requires_client: true,
      is_active: true,
   },
   {
      status: "on_hold",
      label_th: "ระงับชั่วคราว",
      phase: "delivery",
      sort_order: 50,
      is_terminal: false,
      requires_client: true,
      is_active: true,
   },
   {
      status: "closed",
      label_th: "ปิดโครงการ",
      phase: "terminal",
      sort_order: 60,
      is_terminal: true,
      requires_client: true,
      is_active: true,
   },
];

export function buildProjectStatusLabelMap(
   statuses: ProjectStatusMeta[],
): Record<ProjectStatus, string> {
   const labels: Record<ProjectStatus, string> = {
      draft: "แบบร่าง",
      planned: "วางแผน",
      bidding: "ประมูล/เสนอราคา",
      active: "ดำเนินการ",
      on_hold: "ระงับชั่วคราว",
      closed: "ปิดโครงการ",
   };

   for (const s of statuses) {
      labels[s.status] = s.label_th;
   }
   return labels;
}
