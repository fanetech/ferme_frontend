"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, PlusCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarms } from "@/data/farms";
import { useFarmEmployees, useOverdueTasks, useTasksByStatus } from "@/data/hr";
import { EmployeeFormModal, TaskFormModal } from "./components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { safeArray } from "@/lib/utils/safe-array";

const contractLabels: Record<string, string> = { PERMANENT: "Permanent", TEMPORARY: "Temporaire", SEASONAL: "Saisonnier", DAILY: "Journalier", HOURLY: "Horaire", CONTRACT: "Contrat" };
const priorityLabels: Record<string, { label: string; className: string }> = { LOW: { label: "Basse", className: "bg-gray-100 text-gray-800" }, MEDIUM: { label: "Moyenne", className: "bg-blue-100 text-blue-800" }, HIGH: { label: "Haute", className: "bg-orange-100 text-orange-800" }, URGENT: { label: "Urgente", className: "bg-red-100 text-red-800" } };
const taskStatusLabels: Record<string, { label: string; className: string }> = { TODO: { label: "À faire", className: "bg-gray-100 text-gray-800" }, IN_PROGRESS: { label: "En cours", className: "bg-blue-100 text-blue-800" }, COMPLETED: { label: "Terminé", className: "bg-green-100 text-green-800" }, CANCELLED: { label: "Annulé", className: "bg-red-100 text-red-800" }, ON_HOLD: { label: "En pause", className: "bg-yellow-100 text-yellow-800" } };

export default function HRPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isEmpFormOpen, setIsEmpFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: employeesData, isLoading: empLoading } = useFarmEmployees(selectedFarmId);
  const { data: overdueData } = useOverdueTasks();
  const { data: todoData } = useTasksByStatus("TODO");
  const { data: inProgressData } = useTasksByStatus("IN_PROGRESS");
  const employees = safeArray(employeesData?.data);
  const overdueTasks = safeArray(overdueData?.data);
  const allTasks = [...overdueTasks, ...safeArray(todoData?.data), ...safeArray(inProgressData?.data)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="h-6 w-6 text-purple-600" /> Ressources Humaines</h1>
          <p className="text-muted-foreground">Employés, tâches et présences</p>
        </div>
        <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
          <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-red-700"><AlertTriangle className="h-4 w-4" /> Tâches en retard ({overdueTasks.length})</CardTitle></CardHeader>
          <CardContent><div className="space-y-1">{overdueTasks.slice(0, 5).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between text-sm"><span>{t.title} {t.assignedToName ? <span className="text-muted-foreground">— {t.assignedToName}</span> : ""}</span><Badge className="bg-red-100 text-red-800">{t.dueDate}</Badge></div>
          ))}</div></CardContent>
        </Card>
      )}

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20"><Users className="h-12 w-12 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Sélectionnez une ferme</p></div>
      ) : (
        <Tabs defaultValue="employees">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="employees"><Users className="mr-1.5 h-4 w-4" /> Employés ({employees.length})</TabsTrigger>
              <TabsTrigger value="tasks"><ClipboardList className="mr-1.5 h-4 w-4" /> Tâches ({allTasks.length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <PermissionGuard permission={PERMISSIONS.HR.EMPLOYEE_MANAGE}>
                <Button size="sm" variant="outline" onClick={() => setIsEmpFormOpen(true)}><PlusCircle className="mr-1 h-4 w-4" /> Employé</Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.HR.TASK_CREATE}>
                <Button size="sm" onClick={() => setIsTaskFormOpen(true)} className="bg-green-600 hover:bg-green-700"><PlusCircle className="mr-1 h-4 w-4" /> Tâche</Button>
              </PermissionGuard>
            </div>
          </div>

          <TabsContent value="employees" className="mt-4">
            {empLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div> : employees.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Aucun employé</p></div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground"><span>Employé</span><span>Poste</span><span>Contrat</span><span>Téléphone</span><span>Salaire</span><span>Statut</span></div>
                {employees.map((e: any) => (
                  <Link key={e.id} href={`/dashboard/hr/employees/${e.id}`} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors">
                    <div><p className="font-medium">{e.firstName} {e.lastName}</p><p className="text-xs text-muted-foreground font-mono">{e.employeeCode}</p></div>
                    <span>{e.position ?? "—"}</span>
                    <Badge variant="outline">{contractLabels[e.contractType] ?? e.contractType}</Badge>
                    <span className="text-muted-foreground">{e.phoneNumber ?? "—"}</span>
                    <span>{e.salary ? `${e.salary.toLocaleString()} FCFA` : "—"}</span>
                    <span>{e.isActive ? <Badge className="bg-green-100 text-green-700">Actif</Badge> : <Badge className="bg-gray-100 text-gray-700">Inactif</Badge>}</span>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            {allTasks.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Aucune tâche</p></div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground"><span>Tâche</span><span>Assigné à</span><span>Priorité</span><span>Date limite</span><span>Heures</span><span>Statut</span></div>
                {allTasks.map((t: any) => {
                  const priority = priorityLabels[t.priority] ?? { label: t.priority, className: "" };
                  const status = taskStatusLabels[t.status] ?? { label: t.status, className: "" };
                  return (
                    <div key={t.id} className={`grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm ${t.isOverdue ? "bg-red-50/50" : ""}`}>
                      <div><p className="font-medium">{t.title}</p>{t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}</div>
                      <span className="text-muted-foreground">{t.assignedToName ?? "Non assigné"}</span>
                      <Badge className={priority.className}>{priority.label}</Badge>
                      <span className={t.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>{t.dueDate ?? "—"}</span>
                      <span>{t.estimatedHours ? `${t.estimatedHours}h` : "—"}</span>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedFarmId && <EmployeeFormModal open={isEmpFormOpen} onOpenChange={setIsEmpFormOpen} farmId={selectedFarmId} />}
      <TaskFormModal open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} employees={employees} />
    </div>
  );
}
