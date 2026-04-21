import { fetchShowcase, fetchSocialPlatforms } from "@/lib/api";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PortfolioSectionNav from "@/components/layout/PortfolioSectionNav";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import PortfolioSection from "@/components/sections/PortfolioSection";
import ContactSection from "@/components/sections/ContactSection";

export default async function Portfolio() {
   const [data, platforms] = await Promise.all([
      fetchShowcase(),
      fetchSocialPlatforms(),
   ]);

   if (!data || !data.profile) {
      return (
         <main style={{ padding: "100px", textAlign: "center" }}>
            <h1>ไม่พบข้อมูล Showcase</h1>
            <p>กรุณาตรวจสอบการตั้งค่า APP_SHOWCASE_PERSON_ID และฐานข้อมูล</p>
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
