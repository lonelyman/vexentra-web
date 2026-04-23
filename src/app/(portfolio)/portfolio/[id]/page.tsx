import { fetchShowcaseByPersonID, fetchSocialPlatforms } from "@/lib/api";
import PublicPortfolioPage from "@/components/pages/PublicPortfolioPage";

export default async function PortfolioByIDPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = await params;
   const [data, platforms] = await Promise.all([
      fetchShowcaseByPersonID(id),
      fetchSocialPlatforms(),
   ]);

   return (
      <PublicPortfolioPage
         data={data}
         platforms={platforms}
         notFoundTitle="ไม่พบข้อมูล Portfolio"
         notFoundDescription="ไม่พบข้อมูลผู้ใช้งานที่ระบุ หรือยังไม่มีโปรไฟล์สาธารณะ"
      />
   );
}
