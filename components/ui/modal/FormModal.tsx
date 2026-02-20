import React, { ReactNode } from 'react';
import { BaseModal } from './BaseModal';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footerNote?: string;
  className?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  titleIcon,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  isSubmitting = false,
  isDirty = true,
  size = 'xl',
  footerNote,
  className,
}: FormModalProps) {
  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      const confirmed = window.confirm(
        'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir fermer?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      titleIcon={titleIcon}
      subtitle={subtitle}
      size={size}
      noPadding={true}
      className={className}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer - Updated with dark mode support */}
        <div className="flex-shrink-0 px-6 py-4 bg-muted/50 dark:bg-muted/20 border-t border-border">
          <div className="flex items-center justify-between">
            {footerNote && (
              <p className="text-sm text-muted-foreground hidden sm:block">
                {footerNote}
              </p>
            )}
            <div className={cn(
              "flex gap-3 w-full sm:w-auto",
              !footerNote && "ml-auto"
            )}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[120px] h-10"
              >
                <X className="mr-2 h-4 w-4" />
                {cancelLabel}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[140px] h-10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitLabel === 'Créer' ? 'Création...' : 'Enregistrement...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
