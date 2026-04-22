import { Skill } from "@/lib/api";

const PROFICIENCY_LABELS: Record<number, string> = {
   1: "กำลังเรียนรู้",
   2: "พอใช้งานได้",
   3: "ใช้งานคล่อง",
   4: "ชำนาญ",
   5: "เชี่ยวชาญ",
};

export default function SkillsSection({ skills }: { skills: Skill[] }) {
   // Group skills by category
   const categories = skills.reduce(
      (acc, skill) => {
         if (!acc[skill.category]) acc[skill.category] = [];
         acc[skill.category].push(skill);
         return acc;
      },
      {} as Record<string, Skill[]>,
   );

   return (
      <section id="skills">
         <div className="section-label">ทักษะ</div>
         <h2 className="section-title">สิ่งที่ฉันทำได้</h2>
         <p className="section-sub">
            ทักษะที่สะสมมาจากประสบการณ์จริง ผ่านโปรเจกต์หลากหลายประเภท
         </p>

         <div className="skills-legend" aria-label="ระดับความชำนาญ">
            <span className="skills-legend-label">ระดับความชำนาญ:</span>
            {[1, 2, 3, 4, 5].map((lv) => (
               <span
                  key={lv}
                  className="skills-legend-item"
                  data-level={lv}
               >
                  <span className="skills-legend-num">{lv}</span>
                  {PROFICIENCY_LABELS[lv]}
               </span>
            ))}
         </div>

         <div className="skills-layout">
            {Object.entries(categories).map(([category, catSkills]) => (
               <div key={category} className="skill-category-card">
                  <div className="skill-cat-label">{category}</div>

                  {catSkills
                     .sort((a, b) => a.sort_order - b.sort_order)
                     .map((skill) => {
                        let colorClass = "";
                        if (category === "backend") colorClass = "gold";
                        else if (category === "frontend") colorClass = "teal";
                        else if (category === "devops") colorClass = "rose";

                        const label =
                           PROFICIENCY_LABELS[skill.proficiency] ?? "";

                        return (
                           <div key={skill.id} className="skill-item">
                              <span className="skill-name">{skill.name}</span>
                              <span
                                 className={`skill-level ${colorClass}`}
                                 data-level={skill.proficiency}
                              >
                                 {label}
                              </span>
                           </div>
                        );
                     })}
               </div>
            ))}
         </div>
      </section>
   );
}
