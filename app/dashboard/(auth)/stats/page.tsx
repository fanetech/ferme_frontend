import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Activity } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Statistiques en temps réel",
    description: "Consultez les statistiques en temps réel de votre plateforme TPE.",
    canonical: "/dashboard/stats"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Statistiques en temps réel"
      description="Consultez et analysez les statistiques en temps réel de votre plateforme TPE. Suivez les métriques clés, les performances et les indicateurs importants."
      icon={<Activity className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}