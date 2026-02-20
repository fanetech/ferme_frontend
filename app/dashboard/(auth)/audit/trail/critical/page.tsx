import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { AlertTriangle } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Modifications critiques",
    description: "Surveillez les modifications critiques du système.",
    canonical: "/dashboard/audit/trail/critical"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Modifications critiques"
      description="Surveillez les modifications critiques du système."
      icon={<AlertTriangle className="mr-5 h-9 w-9 text-pink-500" />}
    />
  );
}