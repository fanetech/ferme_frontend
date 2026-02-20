import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </div>
  );
};
