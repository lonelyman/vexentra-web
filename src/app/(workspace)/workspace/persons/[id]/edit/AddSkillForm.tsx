"use client";

import type { Skill } from "@/lib/api/types";
import {
   adminAddSkillAction,
   adminUpdateSkillAction,
   adminDeleteSkillAction,
} from "@/app/actions/users";
import SkillManagerForm from "@/components/workspace/SkillManagerForm";

export default function AddSkillForm({
   userId,
   skills,
}: {
   userId: string;
   skills: Skill[];
}) {
   return (
      <SkillManagerForm
         skills={skills}
         addActionFn={adminAddSkillAction}
         updateActionFn={adminUpdateSkillAction}
         deleteActionFn={adminDeleteSkillAction}
         hiddenFields={{ user_id: userId }}
      />
   );
}
