import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import "@/styles/landing.css";

export const metadata = {
   title: "Vexentra คืออะไร — About",
   description:
      "ระบบบริหารโปรเจกต์ที่ออกแบบมาสำหรับคนรับงาน ทีมเล็ก และฟรีแลนซ์ รองรับ Workflow มาตรฐาน Task Management และความโปร่งใสกับลูกค้า",
};

type FeatureIconProps = { children: React.ReactNode };
const FeatureIcon = ({ children }: FeatureIconProps) => (
   <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
   >
      {children}
   </svg>
);

const features = [
   {
      icon: (
         <FeatureIcon>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
         </FeatureIcon>
      ),
      title: "Project Intake",
      desc: "บันทึกงานที่รับเข้ามา ชื่อลูกค้า deadline รายละเอียด มูลค่างาน ครบในที่เดียว",
      soon: false,
   },
   {
      icon: (
         <FeatureIcon>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
         </FeatureIcon>
      ),
      title: "Team & Roles",
      desc: "จัดการสมาชิกในโปรเจกต์ กำหนดบทบาทของแต่ละคนให้ชัดเจน",
      soon: true,
   },
   {
      icon: (
         <FeatureIcon>
            <polyline points="20 6 9 17 4 12" />
         </FeatureIcon>
      ),
      title: "Tasks & Progress",
      desc: "มอบหมายงานย่อย ติดตามความคืบหน้า ดูว่าเป็นไปตามแผนไหม",
      soon: true,
   },
   {
      icon: (
         <FeatureIcon>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
         </FeatureIcon>
      ),
      title: "Client Dashboard",
      desc: "ลูกค้าดูความคืบหน้าโปรเจกต์ของตัวเองได้แบบ real-time ไม่ต้องถามทีละครั้ง",
      soon: true,
   },
   {
      icon: (
         <FeatureIcon>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
         </FeatureIcon>
      ),
      title: "Finance & Transactions",
      desc: "บันทึกรายรับ-รายจ่ายต่อโปรเจกต์ สรุป P&L export CSV สำหรับทำบัญชี",
      soon: false,
   },
   {
      icon: (
         <FeatureIcon>
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
         </FeatureIcon>
      ),
      title: "Auto Portfolio",
      desc: "เมื่อโปรเจกต์จบ กลายเป็นผลงานในโปรไฟล์ได้ทันที ไม่ต้องเขียนซ้ำ",
      soon: false,
   },
];

const workflow = [
   {
      step: "01",
      title: "รับงานเข้าระบบ",
      desc: "บันทึก brief ลูกค้า scope งาน deadline และมูลค่าโปรเจกต์",
   },
   {
      step: "02",
      title: "จัดทีมและวางแผน",
      desc: "เพิ่มสมาชิก มอบหมาย role กำหนด milestone และ task ย่อย",
   },
   {
      step: "03",
      title: "ติดตามและรายงาน",
      desc: "อัปเดตความคืบหน้า บันทึกรายรับ-รายจ่าย ลูกค้าดูสถานะได้ตลอด",
   },
   {
      step: "04",
      title: "ส่งมอบและเก็บผลงาน",
      desc: "ปิดโปรเจกต์ สรุปการเงิน และโปรเจกต์กลายเป็น portfolio อัตโนมัติ",
   },
];

export default function AboutPage() {
   return (
      <div className="landing">
         <PublicNavbar />

         <section className="landing-hero">
            <span className="eyebrow">ABOUT VEXENTRA</span>
            <h1>ระบบที่ออกแบบมาเพื่อการทำงาน</h1>
            <p className="tagline">
               เวลารับงานเข้ามา รายละเอียดกระจายอยู่หลายที่ — chat, Drive,
               กระดาษ, หัวของเราเอง Vexentra รวมทุกอย่างของโปรเจกต์ไว้ที่เดียว
               ตั้งแต่รับงานเข้า จนถึงส่งมอบและเก็บเป็นผลงาน
            </p>
         </section>

         <section className="landing-workflow">
            <h2 className="section-title">Standardized Workflow</h2>
            <p className="section-sub">4 ขั้นตอนที่ครอบคลุมทุกโปรเจกต์</p>
            <div className="workflow-grid">
               {workflow.map((w) => (
                  <div key={w.step} className="workflow-card">
                     <span className="workflow-step">{w.step}</span>
                     <h3>{w.title}</h3>
                     <p>{w.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         <section className="landing-features">
            <h2 className="section-title">สิ่งที่ Vexentra ทำได้</h2>
            <p className="section-sub">
               ฟีเจอร์หลักของแพลตฟอร์ม (บางส่วนกำลังพัฒนา)
            </p>
            <div className="feature-grid">
               {features.map((f) => (
                  <div key={f.title} className="feature-card">
                     {f.soon && <span className="badge">เร็ว ๆ นี้</span>}
                     <span className="icon">{f.icon}</span>
                     <h3>{f.title}</h3>
                     <p>{f.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         <section className="landing-cta-bottom">
            <h2>สนใจใช้งานหรือร่วมพัฒนา?</h2>
            <p>ติดต่อเราเพื่อพูดคุยเพิ่มเติมหรือดูตัวอย่างระบบจริง</p>
            <div className="cta-row">
               <Link href="/contact" className="btn-primary">
                  ติดต่อเรา →
               </Link>
               <Link href="/portfolio" className="btn-ghost">
                  ดู Portfolio ผู้สร้าง
               </Link>
            </div>
         </section>

         <footer className="landing-footer">
            <span className="brand">Vexentra</span> © {new Date().getFullYear()}
         </footer>
      </div>
   );
}
