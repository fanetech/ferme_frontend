import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { AlertTriangle } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Alertes système",
    description: "Gestion et suivi des alertes système.",
    canonical: "/dashboard/alerts"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Alertes système"
      description="Surveillez et gérez les alertes système importantes. Configurez les notifications et suivez les événements critiques de votre plateforme."
      icon={<AlertTriangle className="mr-5 h-9 w-9 text-red-500" />}
    />
  );
}