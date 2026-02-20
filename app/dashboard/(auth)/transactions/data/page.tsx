import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Database } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Données transactionnelles",
    description: "Analysez les données détaillées de vos transactions.",
    canonical: "/dashboard/transactions/data"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Données transactionnelles"
      description="Analysez les données détaillées de vos transactions."
      icon={<Database className="mr-5 h-9 w-9 text-purple-500" />}
    />
  );
}