import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { ArrowLeftRight } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Mapping réponses",
    description: "Définissez le mapping des réponses API.",
    canonical: "/dashboard/catalog/api-config/mapping"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Mapping réponses"
      description="Définissez le mapping des réponses API."
      icon={<ArrowLeftRight className="mr-5 h-9 w-9 text-cyan-500" />}
    />
  );
}