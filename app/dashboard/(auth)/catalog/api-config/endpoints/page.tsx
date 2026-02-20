import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Globe } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Endpoints",
    description: "Gérez les endpoints API pour vos services.",
    canonical: "/dashboard/catalog/api-config/endpoints"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Endpoints"
      description="Gérez les endpoints API pour vos services."
      icon={<Globe className="mr-5 h-9 w-9 text-orange-500" />}
    />
  );
}