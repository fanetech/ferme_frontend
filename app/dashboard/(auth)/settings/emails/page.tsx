import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Mail } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Configuration emails",
    description: "Configurez les paramètres d'envoi d'emails.",
    canonical: "/dashboard/settings/emails"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Configuration emails"
      description="Configurez les paramètres d'envoi d'emails."
      icon={<Mail className="mr-5 h-9 w-9 text-orange-500" />}
    />
  );
}