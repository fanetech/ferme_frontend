import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { History } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Journal d'audit",
    description: "Consultez l'historique complet des modifications.",
    canonical: "/dashboard/audit/trail"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Journal d'audit"
      description="Consultez l'historique complet des modifications."
      icon={<History className="mr-5 h-9 w-9 text-yellow-500" />}
    />
  );
}