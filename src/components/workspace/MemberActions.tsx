"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeMemberAction } from "@/app/actions/members";
import type { Member } from "@/lib/api/types";

interface Props {
   projectId: string;
   member: Member;
}

export default function MemberRemoveButton({ projectId, member }: Props) {
   const router = useRouter();
   const [isPending, startTransition] = useTransition();

   const handleRemove = () => {
      if (!confirm("ต้องการลบสมาชิกคนนี้ออกจากโปรเจกต์ใช่หรือไม่?")) return;
      startTransition(async () => {
         const res = await removeMemberAction(projectId, member.id);
         if (res.error) {
            alert(res.error);
         } else {
            router.refresh();
         }
      });
   };

   return (
      <button
         className="ws-btn-danger-ghost ws-btn-sm"
         onClick={handleRemove}
         disabled={isPending}
      >
         {isPending ? "..." : "ลบ"}
      </button>
   );
}
