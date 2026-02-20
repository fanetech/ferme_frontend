import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Zap } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Tous les logs API",
    description: "Consultez l'historique complet des logs API.",
    canonical: "/dashboard/audit/api-logs"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Tous les logs API"
      description="Consultez l'historique complet des logs API."
      icon={<Zap className="mr-5 h-9 w-9 text-emerald-500" />}
    />
  );
}