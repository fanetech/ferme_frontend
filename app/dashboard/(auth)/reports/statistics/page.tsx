import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { BarChart } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Statistiques",
    description: "Consultez les statistiques détaillées de votre activité.",
    canonical: "/dashboard/reports/statistics"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Statistiques"
      description="Consultez les statistiques détaillées de votre activité."
      icon={<BarChart className="mr-5 h-9 w-9 text-gray-500" />}
    />
  );
}