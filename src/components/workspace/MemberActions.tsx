"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeMemberAction } from "@/app/actions/members";
import type { Member } from "@/lib/api/types";
import ConfirmDialog from "@/components/workspace/ConfirmDialog";

interface Props {
   projectId: string;
   member: Member;
   memberLabel?: string;
}

export default function MemberRemoveButton({ projectId, member, memberLabel }: Props) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [errorOpen, setErrorOpen] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");

   const handleConfirmRemove = () => {
      startTransition(async () => {
         const res = await removeMemberAction(projectId, member.id);
         if (res.error) {
            setErrorMessage(res.error);
            setErrorOpen(true);
         } else {
            setConfirmOpen(false);
            router.refresh();
         }
      });
   };

   return (
      <>
         <button
            className="ws-btn-danger-ghost ws-btn-sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
         >
            {isPending ? "..." : "ลบ"}
         </button>
         <ConfirmDialog
            open={confirmOpen}
            title="ยืนยันลบสมาชิก"
            message={`ต้องการลบ ${memberLabel || "สมาชิกคนนี้"} ออกจากโปรเจกต์ใช่หรือไม่?`}
            confirmLabel="ลบสมาชิก"
            confirming={isPending}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmRemove}
         />
         <ConfirmDialog
            open={errorOpen}
            title="ไม่สามารถลบสมาชิกได้"
            message={errorMessage}
            confirmLabel="รับทราบ"
            onCancel={() => setErrorOpen(false)}
            singleAction
         />
      </>
   );
}
