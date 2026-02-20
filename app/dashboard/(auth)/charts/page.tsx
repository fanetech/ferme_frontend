import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { TrendingUp } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Graphiques des transactions",
    description: "Visualisez les tendances et graphiques des transactions.",
    canonical: "/dashboard/charts"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Graphiques des transactions"
      description="Visualisez les tendances et l'évolution de vos transactions à travers des graphiques interactifs et des analyses détaillées."
      icon={<TrendingUp className="mr-5 h-9 w-9 text-green-500" />}
    />
  );
}