"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFarms } from "@/data/farms";

interface FarmSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FarmSelector({ value, onValueChange, placeholder = "Sélectionner une ferme", className = "w-[250px]" }: FarmSelectorProps) {
  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {farms.map((farm) => (
          <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
