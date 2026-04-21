import { Skill } from "@/lib/api";

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

         <div className="skills-layout">
            {Object.entries(categories).map(([category, catSkills]) => (
               <div key={category} className="skill-category-card">
                  <div className="skill-cat-label">{category}</div>

                  {catSkills
                     .sort((a, b) => a.sort_order - b.sort_order)
                     .map((skill) => (
                        <div key={skill.id} className="skill-item">
                           <span className="skill-name">{skill.name}</span>
                           <div className="skill-dots">
                              {[1, 2, 3, 4, 5].map((level) => {
                                 let colorClass = "";
                                 if (category === "backend")
                                    colorClass = "gold";
                                 else if (category === "frontend")
                                    colorClass = "teal";
                                 else if (category === "devops")
                                    colorClass = "rose";

                                 const isFilled = level <= skill.proficiency;
                                 return (
                                    <div
                                       key={level}
                                       className={`skill-dot ${isFilled ? "filled" : ""} ${isFilled ? colorClass : ""}`}
                                    />
                                 );
                              })}
                           </div>
                        </div>
                     ))}
               </div>
            ))}
         </div>
      </section>
   );
}
