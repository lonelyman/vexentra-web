"use client";

import type { Skill } from "@/lib/api/types";
import {
   addMySkillAction,
   updateMySkillAction,
   deleteMySkillAction,
} from "@/app/actions/profile";
import SkillManagerForm from "@/components/workspace/SkillManagerForm";

export default function AddMySkillForm({ skills }: { skills: Skill[] }) {
   return (
      <SkillManagerForm
         skills={skills}
         addActionFn={addMySkillAction}
         updateActionFn={updateMySkillAction}
         deleteActionFn={deleteMySkillAction}
      />
   );
}
