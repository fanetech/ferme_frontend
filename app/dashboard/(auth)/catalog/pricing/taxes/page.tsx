import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Calculator } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Taxes et commissions",
    description: "Gérez les taxes et commissions applicables.",
    canonical: "/dashboard/catalog/pricing/taxes"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Taxes et commissions"
      description="Gérez les taxes et commissions applicables."
      icon={<Calculator className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}