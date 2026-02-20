"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Phone, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhoneInput, phoneFormats } from "./simple-user-form-schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PhoneInput({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  placeholder = "70 12 34 56"
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneInput(e.target.value);
    onChange(formattedValue);
  };

  const getHintText = () => {
    if (!value) {
      return "Format local (ex: 70 12 34 56) ou international (ex: +226 70 12 34 56)";
    }
    if (value.startsWith('+')) {
      return "🌍 Format international détecté";
    } else if (value.length >= 8 && !value.startsWith('+')) {
      return "🇧🇫 Format local Burkina Faso (+226 sera ajouté automatiquement)";
    }
    return "Format local (ex: 70 12 34 56) ou international (ex: +226 70 12 34 56)";
  };

  return (
    <div className="space-y-2">
      <FormControl>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="tel"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pl-10 pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              !error && value && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">Formats acceptés :</p>
                  <div className="text-xs space-y-1">
                    <p className="text-green-600">✅ Formats valides :</p>
                    {phoneFormats.valid.slice(0, 4).map((format, i) => (
                      <p key={i} className="font-mono">{format}</p>
                    ))}
                    <p className="text-red-600 mt-2">❌ Formats invalides :</p>
                    {phoneFormats.invalid.slice(0, 3).map((format, i) => (
                      <p key={i} className="font-mono">{format || '(vide)'}</p>
                    ))}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </FormControl>
      
      {(isFocused || value) && !error && (
        <FormDescription className="text-xs flex items-center gap-1">
          <span className="text-blue-600">💡</span>
          {getHintText()}
        </FormDescription>
      )}
      
      <FormMessage />
    </div>
  );
}