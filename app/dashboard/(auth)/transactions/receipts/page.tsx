import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Receipt } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Reçus",
    description: "Gérez les reçus et justificatifs de transactions.",
    canonical: "/dashboard/transactions/receipts"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Reçus"
      description="Gérez les reçus et justificatifs de transactions."
      icon={<Receipt className="mr-5 h-9 w-9 text-red-500" />}
    />
  );
}