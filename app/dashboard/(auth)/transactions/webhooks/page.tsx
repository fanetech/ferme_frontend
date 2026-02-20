import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Webhook } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Webhooks",
    description: "Configurez et surveillez les webhooks de transactions.",
    canonical: "/dashboard/transactions/webhooks"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Webhooks"
      description="Configurez et surveillez les webhooks de transactions."
      icon={<Webhook className="mr-5 h-9 w-9 text-yellow-500" />}
    />
  );
}