import { Badge } from "@/components/ui/badge";
import { ClientStatus } from "@/types/clients";

interface ClientBadgeProps {
  status: ClientStatus;
}

export function ClientBadge({ status }: ClientBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Actif",
      variant: "success" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200"
    },
    INACTIVE: {
      label: "Inactif",
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
    },
    BLOCKED: {
      label: "Bloqué",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200"
    },
    SUSPENDED: {
      label: "Suspendu",
      variant: "warning" as const,
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200"
    }
  };

  const config = statusConfig[status] || statusConfig.INACTIVE;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
