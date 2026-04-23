import Link from "next/link";

export default function PublicNavbar() {

   return (
      <nav className="public-nav">
         <Link href="/" className="nav-brand">
            Vexentra<span className="dot">.</span>
         </Link>
         <ul className="nav-links">
            <li>
               <Link href="/">หน้าแรก</Link>
            </li>
            <li>
               <Link href="/about">Vexentra คืออะไร</Link>
            </li>
            <li>
               <Link href="/portfolio">Portfolio</Link>
            </li>
            <li>
               <Link href="/contact">ติดต่อเรา</Link>
            </li>
            <li>
               <Link href="/workspace">Workspace →</Link>
            </li>
         </ul>
      </nav>
   );
}
