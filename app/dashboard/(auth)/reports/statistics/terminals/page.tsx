import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Smartphone } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Usage des terminaux",
    description: "Consultez les statistiques d'usage de vos terminaux.",
    canonical: "/dashboard/reports/statistics/terminals"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Usage des terminaux"
      description="Consultez les statistiques d'usage de vos terminaux."
      icon={<Smartphone className="mr-5 h-9 w-9 text-teal-500" />}
    />
  );
}