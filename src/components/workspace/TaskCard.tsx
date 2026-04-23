"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatusAction, deleteTaskAction } from "@/app/actions/tasks";
import type { Task, TaskStatus } from "@/lib/api/types";

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
   todo: "in_progress",
   in_progress: "done",
   done: "todo",
   cancelled: "todo",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
   todo: "ยังไม่เริ่ม",
   in_progress: "กำลังทำ",
   done: "เสร็จแล้ว",
   cancelled: "ยกเลิก",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
   todo: "var(--text-dim)",
   in_progress: "var(--accent)",
   done: "var(--teal)",
   cancelled: "#6b7280",
};

const PRIORITY_COLOR: Record<string, string> = {
   high: "#f87171",
   medium: "var(--gold)",
   low: "var(--text-dim)",
};

const PRIORITY_LABEL: Record<string, string> = {
   high: "สูง",
   medium: "กลาง",
   low: "ต่ำ",
};

interface Props {
   task: Task;
   projectId: string;
   canEdit?: boolean;
}

export default function TaskCard({ task, projectId, canEdit = true }: Props) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();

   const cycleStatus = () => {
      if (!canEdit) return;
      const nextStatus = STATUS_NEXT[task.status];
      startTransition(async () => {
         const res = await updateTaskStatusAction(projectId, task.id, {
            title: task.title,
            description: task.description,
            status: nextStatus,
            priority: task.priority,
            assigned_person_id: task.assigned_person_id,
            due_date: task.due_date,
         });
         if (res.error) alert(res.error);
         else router.refresh();
      });
   };

   const handleDelete = () => {
      if (!canEdit) return;
      if (!confirm(`ต้องการลบงาน "${task.title}" ใช่หรือไม่?`)) return;
      startTransition(async () => {
         const res = await deleteTaskAction(projectId, task.id);
         if (res.error) alert(res.error);
         else router.refresh();
      });
   };

   const isOverdue =
      task.due_date &&
      task.status !== "done" &&
      task.status !== "cancelled" &&
      new Date(task.due_date) < new Date();

   return (
      <div
         className="ws-task-card"
         style={{ opacity: task.status === "cancelled" ? 0.5 : 1 }}
      >
         <div className="ws-task-card-left">
            {/* Status toggle button */}
            {canEdit ? (
               <button
                  className="ws-task-status-btn"
                  onClick={cycleStatus}
                  disabled={isPending || task.status === "cancelled"}
                  title={`เปลี่ยนเป็น: ${STATUS_LABEL[STATUS_NEXT[task.status]]}`}
                  style={{ color: STATUS_COLOR[task.status] }}
               >
                  {task.status === "done" ? "✓" : task.status === "cancelled" ? "✕" : "○"}
               </button>
            ) : (
               <span
                  className="ws-task-status-btn"
                  style={{
                     color: STATUS_COLOR[task.status],
                     cursor: "default",
                     pointerEvents: "none",
                  }}
               >
                  {task.status === "done" ? "✓" : task.status === "cancelled" ? "✕" : "○"}
               </span>
            )}

            <div className="ws-task-body">
               <div
                  className="ws-task-title"
                  style={{
                     textDecoration:
                        task.status === "done" || task.status === "cancelled"
                           ? "line-through"
                           : "none",
                     color:
                        task.status === "done" || task.status === "cancelled"
                           ? "var(--text-dim)"
                           : "var(--text)",
                  }}
               >
                  {task.title}
               </div>
               {task.description && (
                  <div className="ws-task-desc">{task.description}</div>
               )}
               <div className="ws-task-meta">
                  <span
                     className="ws-task-priority"
                     style={{ color: PRIORITY_COLOR[task.priority] }}
                  >
                     ● {PRIORITY_LABEL[task.priority]}
                  </span>
                  {task.due_date && (
                     <span
                        className="ws-task-due"
                        style={{ color: isOverdue ? "#f87171" : "var(--text-dim)" }}
                     >
                        {isOverdue ? "⚠ " : ""}กำหนด {task.due_date}
                     </span>
                  )}
               </div>
            </div>
         </div>

         <div className="ws-task-actions">
            <span
               className="ws-task-status-label"
               style={{ color: STATUS_COLOR[task.status] }}
            >
               {STATUS_LABEL[task.status]}
            </span>
            {canEdit && (
               <button
                  className="ws-btn-danger-ghost ws-btn-sm"
                  onClick={handleDelete}
                  disabled={isPending}
               >
                  ลบ
               </button>
            )}
         </div>
      </div>
   );
}
