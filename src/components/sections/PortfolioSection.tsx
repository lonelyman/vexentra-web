import { PortfolioItem } from "@/lib/api";

export default function PortfolioSection({
   portfolio,
}: {
   portfolio: PortfolioItem[];
}) {
   return (
      <section id="portfolio">
         <div className="section-label">ผลงาน</div>
         <h2 className="section-title">โปรเจกต์ที่ภูมิใจ</h2>
         <p className="section-sub">
            ผลงานคัดสรรจากประสบการณ์ทำงานจริงที่ผ่านมา
         </p>

         <div className="portfolio-grid">
            {portfolio.map((item, i) => {
               // Add some dynamic color cover classes based on index
               const covers = [
                  "cover-a",
                  "cover-b",
                  "cover-c",
                  "cover-d",
                  "cover-e",
                  "cover-f",
               ];
               const coverClass = covers[i % covers.length];

               return (
                  <div
                     key={item.id}
                     className={`portfolio-card ${item.featured ? "featured" : ""}`}
                  >
                     <div className={`portfolio-cover ${coverClass}`}>
                        {item.cover_image_url || "📄"}
                        {item.featured && (
                           <div className="featured-badge">⭐ Featured</div>
                        )}
                     </div>
                     <div className="portfolio-body">
                        <div className="portfolio-status-row">
                           {item.status === "published" ? (
                              <span className="status-badge status-published">
                                 Published
                              </span>
                           ) : (
                              <span className="status-badge status-draft">
                                 Draft
                              </span>
                           )}
                        </div>
                        <div className="portfolio-title">{item.title}</div>
                        <p className="portfolio-summary">{item.summary}</p>

                        <div className="portfolio-footer">
                           <div className="portfolio-tags">
                              {item.tags?.map((t, idx) => {
                                 const colors = ["gold", "teal", "rose", ""];
                                 const c = colors[idx % colors.length];
                                 return (
                                    <span key={t.id} className={`ptag ${c}`}>
                                       {t.name}
                                    </span>
                                 );
                              })}
                           </div>
                           <div className="portfolio-links">
                              {item.status === "published" && (item.demo_url || item.source_url) && (
                                 <a
                                    href={item.demo_url || item.source_url}
                                    className="plink"
                                    title="ดูผลงาน"
                                    target="_blank"
                                    rel="noreferrer"
                                 >
                                    ↗
                                 </a>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
