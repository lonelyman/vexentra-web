import { fetchShowcase, fetchSocialPlatforms } from "@/lib/api";
import PublicPortfolioPage from "@/components/pages/PublicPortfolioPage";

export default async function Portfolio() {
   const [data, platforms] = await Promise.all([
      fetchShowcase(),
      fetchSocialPlatforms(),
   ]);

   return (
      <PublicPortfolioPage
         data={data}
         platforms={platforms}
         notFoundTitle="ไม่พบข้อมูล Showcase"
         notFoundDescription="กรุณาตรวจสอบการตั้งค่า APP_SHOWCASE_PERSON_ID และฐานข้อมูล"
      />
   );
}
