import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  titleIcon?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  contentClassName?: string;
  showHeader?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  subtitle,
  children,
  size = 'md',
  className,
  contentClassName,
  showHeader = true,
  headerClassName,
  bodyClassName,
  noPadding = false,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] flex flex-col overflow-hidden",
          // Dark mode improvements - using CSS variables
          "bg-background border-border",
          noPadding && "p-0",
          className
        )}
      >
        {showHeader && title && (
          <DialogHeader className={cn(
            "flex-shrink-0",
            // Updated header styling with dark mode support
            "bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5",
            "border-b border-border",
            !noPadding && "px-6 py-5",
            noPadding && "px-6 py-5",
            headerClassName
          )}>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {titleIcon}
              {typeof title === 'string' ? (
                <div>
                  <span className="font-semibold text-foreground">
                    {title}
                  </span>
                  {subtitle && (
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              ) : (
                title
              )}
            </DialogTitle>
          </DialogHeader>
        )}
        <div className={cn(
          "flex-1 min-h-0",
          !noPadding && "px-6 py-6",
          contentClassName,
          bodyClassName
        )}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
