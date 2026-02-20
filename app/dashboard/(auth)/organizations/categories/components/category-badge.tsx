"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  status: string;
  className?: string;
}

export function CategoryBadge({ status, className }: CategoryBadgeProps) {
  const isActive = status === "ACTIVE";
  
  return (
    <Badge 
      variant={isActive ? "default" : "secondary"} 
      className={cn(
        "text-xs",
        isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100",
        className
      )}
    >
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  );
}