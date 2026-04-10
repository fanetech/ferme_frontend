"use client";

import type { LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title = "Aucun résultat",
  description = "Aucune donnée à afficher pour le moment.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p className="text-base font-medium text-muted-foreground">{title}</p>
      <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">{description}</p>
      {action && (
        <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
