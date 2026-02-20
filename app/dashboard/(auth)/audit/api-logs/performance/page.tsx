import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Activity } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Performance API",
    description: "Surveillez les performances de vos APIs.",
    canonical: "/dashboard/audit/api-logs/performance"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Performance API"
      description="Surveillez les performances de vos APIs."
      icon={<Activity className="mr-5 h-9 w-9 text-green-500" />}
    />
  );
}