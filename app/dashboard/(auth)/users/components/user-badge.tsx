"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, MinusCircle, XCircle, Lock, Clock, HelpCircle } from "lucide-react";
import type { User } from "@/types/users";
import { getUserStatusConfig } from "./user-status-mapper";

interface UserBadgeProps {
  status: User['accountStatus'];
  className?: string;
  showTooltip?: boolean;
  showDescription?: boolean;
}

const StatusIcons = {
  CheckCircle,
  MinusCircle,
  XCircle,
  Lock,
  Clock,
  HelpCircle,
};

export function UserBadge({ status, className, showTooltip = true, showDescription = false }: UserBadgeProps) {
  const config = getUserStatusConfig(status);
  const IconComponent = StatusIcons[config.icon as keyof typeof StatusIcons];
  
  const badgeContent = (
    <Badge 
      variant={config.variant} 
      className={cn(
        "text-xs gap-1.5",
        config.className,
        className
      )}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return (
      <div className="space-y-1">
        {badgeContent}
        {showDescription && (
          <p className="text-xs text-muted-foreground">{config.description}</p>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-white">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}