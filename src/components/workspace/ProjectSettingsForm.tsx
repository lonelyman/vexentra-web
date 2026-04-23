"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProjectSettingsAction } from "@/app/actions/projects";
import type { FinanceVisibility, Project, ProjectStatus } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = {};

const VISIBILITY_OPTIONS: Array<{ value: FinanceVisibility; label: string }> = [
   { value: "all_members", label: "สมาชิกทุกคนในโปรเจกต์" },
   { value: "lead_coordinator_staff", label: "Lead / Coordinator / Staff" },
   { value: "staff_only", label: "เฉพาะ Staff (Admin/Manager)" },
];

interface Props {
   project: Project;
   canEdit: boolean;
}

export default function ProjectSettingsForm({ project, canEdit }: Props) {
   const router = useRouter();
   const [state, action, pending] = useActionState(
      updateProjectSettingsAction,
      initialState,
   );

   useEffect(() => {
      if (!state.success) return;
      router.refresh();
   }, [state.success, router]);

   return (
      <form action={action} className="ws-fin-card">
         <input type="hidden" name="project_id" value={project.id} />
         <input type="hidden" name="project_code" value={project.project_code} />
         <input type="hidden" name="name" value={project.name} />
         <input type="hidden" name="status" value={project.status as ProjectStatus} />
         <input type="hidden" name="project_kind" value={project.project_kind} />
         <input type="hidden" name="description" value={project.description ?? ""} />
         <input type="hidden" name="client_person_id" value={project.client_person_id ?? ""} />
         <input type="hidden" name="client_name_raw" value={project.client_name_raw ?? ""} />
         <input type="hidden" name="client_email_raw" value={project.client_email_raw ?? ""} />
         <input type="hidden" name="scheduled_start_at" value={project.scheduled_start_at ?? ""} />
         <input type="hidden" name="deadline_at" value={project.deadline_at ?? ""} />

         <div className="ws-form-group">
            <label className="ws-form-label ws-form-label--required" htmlFor="contract-fin-visibility">
               สิทธิ์ดูข้อมูลส่วนว่าจ้าง
            </label>
            <select
               id="contract-fin-visibility"
               name="contract_finance_visibility"
               className="ws-form-select"
               defaultValue={project.contract_finance_visibility}
               disabled={!canEdit || pending}
               required
            >
               {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </select>
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label ws-form-label--required" htmlFor="expense-fin-visibility">
               สิทธิ์ดูข้อมูลส่วนค่าใช้จ่าย
            </label>
            <select
               id="expense-fin-visibility"
               name="expense_finance_visibility"
               className="ws-form-select"
               defaultValue={project.expense_finance_visibility}
               disabled={!canEdit || pending}
               required
            >
               {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                     {opt.label}
                  </option>
               ))}
            </select>
         </div>

         {!canEdit && (
            <div className="ws-form-help">
               สิทธิ์ไม่พอสำหรับแก้ไข Project Settings (member อ่านอย่างเดียว)
            </div>
         )}

         {state.error && <div className="ws-form-error">{state.error}</div>}

         {canEdit && (
            <div className="ws-dialog-actions">
               <button
                  type="submit"
                  className="ws-btn-primary"
                  disabled={pending}
               >
                  {pending ? "กำลังบันทึก..." : "บันทึก Project Settings"}
               </button>
            </div>
         )}
      </form>
   );
}
