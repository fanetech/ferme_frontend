import { Search, Filter, X, PlusCircle, ColumnsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import type { FilterConfig } from "@/types/data-table";
import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<T> {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  table?: Table<T>;
}

export function DataTableToolbar<T>({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters = [],
  table
}: DataTableToolbarProps<T>) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Maintenir le focus après le re-render si l'utilisateur était en train de taper
  useEffect(() => {
    if (isFocused && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchValue, isFocused]);
  const hasActiveFilters = filters.some(filter => 
    filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : filter.value !== "ALL")
  );

  const getActiveFilterBadges = () => {
    return filters
      .filter(filter => filter.value && filter.value !== "ALL")
      .map(filter => {
        if (filter.type === 'select' && filter.options) {
          const selectedOption = filter.options.find(opt => opt.value === filter.value);
          return selectedOption ? {
            key: filter.key,
            label: filter.label,
            value: selectedOption.label,
            onRemove: () => filter.onChange("ALL")
          } : null;
        } else if (filter.type === 'input') {
          return {
            key: filter.key,
            label: filter.label,
            value: filter.value as string,
            onRemove: () => filter.onChange("")
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const FilterPopover = ({ filter }: { filter: FilterConfig }) => {
    // Pour les filtres de type input, afficher simplement un Input
    if (filter.type === 'input') {
      return (
        <Input
          placeholder={filter.placeholder || `${filter.label}...`}
          value={filter.value as string || ''}
          onChange={(e) => filter.onChange(e.target.value)}
          className="w-48"
        />
      );
    }

    // Popover plus large pour SuperStructure
    const popoverWidth = filter.key === 'superStructureId' ? 'w-80' : 'w-52';
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <PlusCircle className="h-4 w-4" />
            {filter.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`${popoverWidth} p-0`}>
        <Command>
          <CommandInput placeholder={`Rechercher ${filter.label.toLowerCase()}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>Aucun {filter.label.toLowerCase()} trouvé.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="ALL"
                onSelect={() => filter.onChange("ALL")}
              >
                <div className="flex items-center space-x-3 py-1">
                  <Checkbox
                    checked={filter.value === "ALL" || !filter.value}
                    disabled
                  />
                  <label className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tous
                  </label>
                </div>
              </CommandItem>
              {filter.options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => filter.onChange(option.value)}
                >
                  <div className="flex items-center space-x-3 py-1">
                    <Checkbox 
                      checked={filter.value === option.value}
                      disabled
                    />
                    <label className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {option.label}
                    </label>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        {/* Recherche */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-10 w-42 md:w-64 relative"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange?.("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Badges des filtres actifs */}
        {getActiveFilterBadges().length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {getActiveFilterBadges().map((badge) => (
              <Badge
                key={badge.key}
                variant="secondary"
                className="gap-1"
              >
                {badge.label}: {badge.value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={badge.onRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Filtres desktop */}
        {filters.length > 0 && (
          <div className="hidden gap-2 md:flex">
            {filters.map((filter) => (
              <FilterPopover key={filter.key} filter={filter} />
            ))}
          </div>
        )}

        {/* Filtres mobile */}
        {filters.length > 0 && (
          <div className="inline md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1 text-xs">
                      {filters.filter(f => f.value && f.value !== "ALL").length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-4">
                <div className="grid space-y-2">
                  {filters.map((filter) => (
                    <FilterPopover key={filter.key} filter={filter} />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Contrôles des colonnes */}
      {table && (
        <div className="ms-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span className="hidden lg:inline">Colonnes</span> 
                <ColumnsIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}