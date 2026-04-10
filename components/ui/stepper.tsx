"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    {
                      "border-primary bg-primary text-primary-foreground": isActive || isCompleted,
                      "border-muted-foreground bg-background": !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn("text-sm font-medium", {
                      "text-primary": isActive || isCompleted,
                      "text-muted-foreground": !isActive && !isCompleted,
                    })}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-[2px] flex-1 transition-colors",
                  {
                    "bg-primary": isCompleted,
                    "bg-muted": !isCompleted,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface StepperContentProps {
  step: number;
  currentStep: number;
  children: React.ReactNode;
}

export function StepperContent({ step, currentStep, children }: StepperContentProps) {
  if (step !== currentStep) return null;
  return <div className="mt-6">{children}</div>;
}

interface StepperActionsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
}

export function StepperActions({
  onPrevious,
  onNext,
  onSubmit,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
  isFirstStep = false,
  isSubmitting = false,
  nextLabel = "Suivant",
  previousLabel = "Précédent",
  submitLabel = "Soumettre",
}: StepperActionsProps) {
  return (
    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || !canGoPrevious || isSubmitting}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {previousLabel}
      </button>
      
      {isLastStep ? (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={!canGoNext || isSubmitting}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Envoi..." : submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}
