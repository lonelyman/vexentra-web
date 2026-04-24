import type { FullProfileData, SocialPlatform } from "@/lib/api";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PortfolioSectionNav from "@/components/layout/PortfolioSectionNav";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import ContactSection from "@/components/sections/ContactSection";

export default function PublicPortfolioPage({
   data,
   platforms,
   notFoundTitle = "ไม่พบข้อมูล Portfolio",
   notFoundDescription = "ไม่พบข้อมูลผู้ใช้งานที่ระบุ",
}: {
   data: FullProfileData | null;
   platforms: SocialPlatform[];
   notFoundTitle?: string;
   notFoundDescription?: string;
}) {
   if (!data || !data.profile) {
      return (
         <main style={{ padding: "100px", textAlign: "center" }}>
            <h1>{notFoundTitle}</h1>
            <p>{notFoundDescription}</p>
         </main>
      );
   }

   return (
      <>
         <PublicNavbar />
         <HeroSection profile={data.profile} platforms={platforms} />
         <PortfolioSectionNav />
         <SkillsSection skills={data.skills} />
         <ExperienceSection experiences={data.experiences} />
         <PortfolioSection portfolio={data.portfolio} />
         <ContactSection profile={data.profile} platforms={platforms} />
         <Footer profile={data.profile} />
      </>
   );
}
