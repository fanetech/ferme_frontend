import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { TrendingUp } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Performance par service",
    description: "Analysez les performances de chaque service.",
    canonical: "/dashboard/reports/statistics/services"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Performance par service"
      description="Analysez les performances de chaque service."
      icon={<TrendingUp className="mr-5 h-9 w-9 text-orange-500" />}
    />
  );
}