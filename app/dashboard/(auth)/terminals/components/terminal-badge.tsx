import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TerminalStatus } from "@/types";

interface TerminalBadgeProps {
  status: TerminalStatus;
  className?: string;
}

const statusConfig: Record<TerminalStatus, { label: string; variant: any; className: string }> = {
  ACTIVE: {
    label: "Actif",
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
  },
  INACTIVE: {
    label: "Inactif",
    variant: "secondary",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:hover:bg-gray-800/30"
  },
  SUSPENDED: {
    label: "Suspendu",
    variant: "warning",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
  },
  BLOCKED: {
    label: "Bloqué",
    variant: "destructive",
    className: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
  },
  PENDING: {
    label: "En attente",
    variant: "outline",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
  },
  EXPIRED: {
    label: "Expiré",
    variant: "destructive",
    className: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
  }
};

export function TerminalBadge({ status, className }: TerminalBadgeProps) {
  const config = statusConfig[status] || statusConfig.INACTIVE;
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
