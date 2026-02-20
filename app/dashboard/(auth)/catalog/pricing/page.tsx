import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { DollarSign } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Tarifs par service",
    description: "Configurez les règles de tarification pour vos services.",
    canonical: "/dashboard/catalog/pricing"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Tarifs par service"
      description="Configurez les règles de tarification pour vos services."
      icon={<DollarSign className="mr-5 h-9 w-9 text-emerald-500" />}
    />
  );
}