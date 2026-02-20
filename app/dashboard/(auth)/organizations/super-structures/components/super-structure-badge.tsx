import { Badge } from "@/components/ui/badge";

interface SuperStructureBadgeProps {
  status: string;
}

export function SuperStructureBadge({ status }: SuperStructureBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Actif",
      className: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
    },
    INACTIVE: {
      label: "Inactif",
      className: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
    },
    PENDING: {
      label: "En attente",
      className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
    },
    SUSPENDED: {
      label: "Suspendu",
      className: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
  };

  return (
    <Badge className={`capitalize ${config.className}`}>
      {config.label}
    </Badge>
  );
}