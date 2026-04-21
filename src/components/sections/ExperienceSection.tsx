import { Experience } from "@/lib/api";

export default function ExperienceSection({
   experiences,
}: {
   experiences: Experience[];
}) {
   // Format dates: "2021-01-01T00:00:00Z" -> "2021"
   const getYear = (dateStr: string) =>
      new Date(dateStr).getFullYear().toString();

   return (
      <section id="experience">
         <div className="section-label">ประสบการณ์</div>
         <h2 className="section-title">เส้นทางการทำงาน</h2>
         <p className="section-sub">
            ประสบการณ์จากองค์กรที่หลากหลาย ทั้งเอเจนซี่ ฟรีแลนซ์
            และธุรกิจของตัวเอง
         </p>

         <div className="timeline">
            {[...experiences]
               .sort((a, b) => a.sort_order - b.sort_order)
               .map((exp) => (
                  <div key={exp.id} className="timeline-item">
                     <div className="timeline-dot-wrap">
                        <div
                           className={`timeline-dot ${exp.is_current ? "current" : ""}`}
                        ></div>
                     </div>
                     <div className="timeline-body">
                        <div className="timeline-header">
                           <span className="timeline-position">
                              {exp.position}
                           </span>
                           <span className="timeline-period">
                              {getYear(exp.started_at)} —{" "}
                              {exp.is_current
                                 ? "ปัจจุบัน"
                                 : exp.ended_at
                                   ? getYear(exp.ended_at)
                                   : "ปัจจุบัน"}
                           </span>
                        </div>
                        <div className="timeline-company-row">
                           <span className="timeline-company">
                              {exp.company}
                           </span>
                           <span className="timeline-location">
                              📍 {exp.location}
                           </span>
                           {exp.is_current && (
                              <span className="current-badge">กำลังทำงาน</span>
                           )}
                        </div>
                        <p className="timeline-desc">{exp.description}</p>
                     </div>
                  </div>
               ))}
         </div>
      </section>
   );
}
