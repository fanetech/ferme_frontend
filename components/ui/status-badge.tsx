"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-800",
};

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <Badge className={cn(variantStyles[variant], className)}>
      {label}
    </Badge>
  );
}

/**
 * Maps common status strings to badge variants
 */
const statusMap: Record<string, { label: string; variant: StatusVariant }> = {
  ACTIVE: { label: "Actif", variant: "success" },
  INACTIVE: { label: "Inactif", variant: "neutral" },
  BLOCKED: { label: "Bloqué", variant: "error" },
  SUSPENDED: { label: "Suspendu", variant: "error" },
  ABANDONED: { label: "Abandonné", variant: "error" },
  DELETED: { label: "Supprimé", variant: "error" },
  PENDING: { label: "En attente", variant: "warning" },
  CONFIRMED: { label: "Confirmé", variant: "info" },
  PROCESSING: { label: "En cours", variant: "info" },
  COMPLETED: { label: "Terminé", variant: "success" },
  DELIVERED: { label: "Livré", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
  PAID: { label: "Payé", variant: "success" },
  OVERDUE: { label: "En retard", variant: "error" },
  HEALTHY: { label: "Sain", variant: "success" },
  SICK: { label: "Malade", variant: "error" },
};

export function AutoStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] ?? { label: status, variant: "neutral" as StatusVariant };
  return <StatusBadge label={config.label} variant={config.variant} className={className} />;
}
