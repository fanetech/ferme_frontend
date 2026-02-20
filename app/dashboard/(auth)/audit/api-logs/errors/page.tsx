import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { AlertCircle } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Erreurs API",
    description: "Analysez les erreurs et problèmes API.",
    canonical: "/dashboard/audit/api-logs/errors"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Erreurs API"
      description="Analysez les erreurs et problèmes API."
      icon={<AlertCircle className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}