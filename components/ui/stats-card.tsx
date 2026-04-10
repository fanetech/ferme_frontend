"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  href?: string;
  variant?: "default" | "green" | "blue" | "orange" | "red" | "purple";
}

const variantStyles = {
  default: "text-muted-foreground",
  green: "text-green-600",
  blue: "text-blue-600",
  orange: "text-orange-600",
  red: "text-red-600",
  purple: "text-purple-600",
};

export function StatsCard({ title, value, icon: Icon, description, loading, href, variant = "default" }: StatsCardProps) {
  const content = (
    <Card className={cn("transition-shadow", href && "hover:shadow-md cursor-pointer")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", variantStyles[variant])} />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
