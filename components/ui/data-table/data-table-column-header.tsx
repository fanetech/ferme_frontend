import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps {
  title: string;
  field: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  canSort?: boolean;
}

export function DataTableColumnHeader({
  title,
  field,
  sortBy,
  sortDir,
  onSort,
  canSort = true
}: DataTableColumnHeaderProps) {
  if (!canSort || !onSort) {
    return <span className="font-medium">{title}</span>;
  }

  const isSorted = sortBy === field;
  const nextDirection = isSorted && sortDir === 'ASC' ? 'DESC' : 'ASC';

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field, nextDirection)}
      className="-ml-3 h-8 data-[state=open]:bg-accent"
    >
      <span>{title}</span>
      {isSorted ? (
        sortDir === 'ASC' ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}