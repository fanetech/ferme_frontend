import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Download } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Export personnalisé",
    description: "Créez et exportez des rapports personnalisés.",
    canonical: "/dashboard/reports/custom-export"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Export personnalisé"
      description="Créez et exportez des rapports personnalisés."
      icon={<Download className="mr-5 h-9 w-9 text-indigo-500" />}
    />
  );
}