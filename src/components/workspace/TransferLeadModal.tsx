"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { transferLeadAction } from "@/app/actions/members";
import ConfirmDialog from "@/components/workspace/ConfirmDialog";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

type Candidate = {
   member_id: string;
   label: string;
};

interface Props {
   projectId: string;
   currentLeadLabel: string;
   candidates: Candidate[];
}

export default function TransferLeadModal({
   projectId,
   currentLeadLabel,
   candidates,
}: Props) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(transferLeadAction, init);
   const [selectedMemberId, setSelectedMemberId] = useState("");
   const [infoOpen, setInfoOpen] = useState(false);

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         setSelectedMemberId("");
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const handleOpen = () => {
      if (candidates.length === 0) {
         setInfoOpen(true);
         return;
      }
      open();
   };
   const close = () => {
      backdropRef.current?.classList.remove("open");
      setSelectedMemberId("");
   };

   return (
      <>
         <button
            type="button"
            className="ws-btn-ghost ws-btn-sm"
            onClick={handleOpen}
            title="โอนสิทธิ์หัวหน้าทีม"
         >
            โอนสิทธิ์
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">โอนสิทธิ์หัวหน้าทีม</div>

               <p className="ws-confirm-dialog-message" style={{ marginBottom: 12 }}>
                  หัวหน้าปัจจุบัน: <strong>{currentLeadLabel}</strong>
               </p>

               {state.error ? <div className="ws-form-error">{state.error}</div> : null}

               <form action={action}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="member_id" value={selectedMemberId} />

                  <div className="ws-form-group">
                     <label className="ws-form-label ws-form-label--required">เลือกผู้รับสิทธิ์หัวหน้าทีม</label>
                     <div className="ws-member-picker-list">
                        {candidates.map((candidate) => (
                           <button
                              key={candidate.member_id}
                              type="button"
                              className={`ws-member-picker-row${selectedMemberId === candidate.member_id ? " selected" : ""}`}
                              onClick={() => setSelectedMemberId(candidate.member_id)}
                           >
                              <div className="ws-member-picker-main">
                                 <div className="ws-member-picker-name">{candidate.label}</div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close} disabled={pending}>
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className="ws-btn-primary"
                        disabled={pending || !selectedMemberId}
                     >
                        {pending ? "กำลังโอนสิทธิ์..." : "ยืนยันโอนสิทธิ์"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
         <ConfirmDialog
            open={infoOpen}
            title="ยังโอนสิทธิ์ไม่ได้"
            message="ต้องมีสมาชิกคนอื่นในโปรเจกต์ก่อน จึงจะโอนสิทธิ์หัวหน้าทีมได้"
            confirmLabel="รับทราบ"
            onCancel={() => setInfoOpen(false)}
            singleAction
         />
      </>
   );
}
