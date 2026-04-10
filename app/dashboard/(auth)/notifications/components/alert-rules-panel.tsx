"use client";

import { useState } from "react";
import { ShieldAlert, Power, Zap, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarms } from "@/data/farms";
import { useFarmAlertRules, useToggleAlertRule } from "@/data/notifications";

const priorityLabels: Record<string, { label: string; className: string }> = {
  LOW: { label: "Basse", className: "bg-gray-100 text-gray-800" },
  MEDIUM: { label: "Moyenne", className: "bg-blue-100 text-blue-800" },
  HIGH: { label: "Haute", className: "bg-orange-100 text-orange-800" },
  URGENT: { label: "Urgente", className: "bg-red-100 text-red-800" },
};

const conditionLabels: Record<string, string> = {
  GREATER_THAN: ">", LESS_THAN: "<", EQUALS: "=", NOT_EQUALS: "≠",
  GREATER_THAN_OR_EQUAL: "≥", LESS_THAN_OR_EQUAL: "≤",
  BETWEEN: "entre", IN_RANGE: "dans plage", OUT_OF_RANGE: "hors plage",
};

export function AlertRulesPanel() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: rulesData, isLoading } = useFarmAlertRules(selectedFarmId);
  const toggleRule = useToggleAlertRule();
  const rules = rulesData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Règles d'alerte</h2>
        <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
          <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!selectedFarmId ? (
        <div className="text-center py-10"><ShieldAlert className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Sélectionnez une ferme pour voir ses règles d'alerte</p></div>
      ) : isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune règle d'alerte configurée</p></div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule: any) => {
            const priority = priorityLabels[rule.priority] ?? { label: rule.priority, className: "" };
            return (
              <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{rule.name}</p>
                        <Badge className={priority.className}>{priority.label}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">{rule.ruleCode}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.entityType}.{rule.fieldName} {conditionLabels[rule.condition] ?? rule.condition} {rule.thresholdValue}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Vérifié toutes les {rule.checkIntervalMinutes} min</span>
                        <span>Cooldown: {rule.cooldownMinutes} min</span>
                        <span>Déclenché {rule.triggerCount} fois</span>
                        {rule.lastTriggeredAt && <span>Dernier: {new Date(rule.lastTriggeredAt).toLocaleString("fr-FR")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule.mutate(rule.id)}
                        disabled={toggleRule.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
