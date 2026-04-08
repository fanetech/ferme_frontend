"use client";

import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children?: React.ReactNode; // right-side actions
}

export function PageHeader({ title, description, icon: Icon, iconColor = "text-gray-600", children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
