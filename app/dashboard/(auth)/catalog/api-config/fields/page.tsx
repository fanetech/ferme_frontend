import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Database } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Champs de données",
    description: "Configurez les champs de données pour vos services.",
    canonical: "/dashboard/catalog/api-config/fields"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Champs de données"
      description="Configurez les champs de données pour vos services."
      icon={<Database className="mr-5 h-9 w-9 text-teal-500" />}
    />
  );
}