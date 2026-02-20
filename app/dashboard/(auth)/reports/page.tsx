import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { FileText } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Rapports prédéfinis",
    description: "Accédez aux rapports prédéfinis de votre plateforme.",
    canonical: "/dashboard/reports"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Rapports prédéfinis"
      description="Accédez à une sélection de rapports prédéfinis pour analyser vos performances et activités commerciales."
      icon={<FileText className="mr-5 h-9 w-9 text-emerald-500" />}
    />
  );
}