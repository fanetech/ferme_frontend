"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ClipboardList, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployee, useTasksByEmployee, useEmployeeAttendance } from "@/data/hr";

const contractLabels: Record<string, string> = { PERMANENT: "Permanent", TEMPORARY: "Temporaire", SEASONAL: "Saisonnier", DAILY: "Journalier", HOURLY: "Horaire", CONTRACT: "Contrat" };
const genderLabels: Record<string, string> = { M: "Homme", F: "Femme", OTHER: "Autre" };
const taskStatusLabels: Record<string, { label: string; className: string }> = { TODO: { label: "À faire", className: "bg-gray-100 text-gray-800" }, IN_PROGRESS: { label: "En cours", className: "bg-blue-100 text-blue-800" }, COMPLETED: { label: "Terminé", className: "bg-green-100 text-green-800" }, CANCELLED: { label: "Annulé", className: "bg-red-100 text-red-800" }, ON_HOLD: { label: "En pause", className: "bg-yellow-100 text-yellow-800" } };
const attendanceLabels: Record<string, { label: string; className: string }> = { PRESENT: { label: "Présent", className: "bg-green-100 text-green-800" }, ABSENT: { label: "Absent", className: "bg-red-100 text-red-800" }, LATE: { label: "Retard", className: "bg-yellow-100 text-yellow-800" }, HALF_DAY: { label: "Demi-journée", className: "bg-blue-100 text-blue-800" }, SICK_LEAVE: { label: "Congé maladie", className: "bg-orange-100 text-orange-800" }, ANNUAL_LEAVE: { label: "Congé annuel", className: "bg-purple-100 text-purple-800" }, HOLIDAY: { label: "Jour férié", className: "bg-indigo-100 text-indigo-800" }, UNPAID_LEAVE: { label: "Congé sans solde", className: "bg-gray-100 text-gray-800" } };

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: empData, isLoading } = useEmployee(id);
  const { data: tasksData } = useTasksByEmployee(id);
  const { data: attendanceData } = useEmployeeAttendance(id);

  const emp = empData?.data;
  const tasks = tasksData?.data ?? [];
  const attendance = attendanceData?.data ?? [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!emp) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Employé introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/hr">Retour</Link></Button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/hr"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold">{emp.firstName} {emp.lastName}</h1>
            {emp.isActive ? <Badge className="bg-green-100 text-green-800">Actif</Badge> : <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{emp.employeeCode} — {emp.position ?? "Poste non défini"}</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Prénom" value={emp.firstName} />
            <InfoRow label="Nom" value={emp.lastName} />
            <InfoRow label="Genre" value={emp.gender ? genderLabels[emp.gender] : undefined} />
            <InfoRow label="Téléphone" value={emp.phoneNumber} />
            <InfoRow label="Email" value={emp.email} />
            <InfoRow label="Date naissance" value={emp.birthDate} />
            <InfoRow label="N° identité" value={emp.nationalId} />
            <InfoRow label="Adresse" value={emp.address} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Contrat</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Poste" value={emp.position} />
            <InfoRow label="Département" value={emp.department} />
            <InfoRow label="Contrat" value={contractLabels[emp.contractType] ?? emp.contractType} />
            <InfoRow label="Embauche" value={emp.hireDate} />
            <InfoRow label="Fin contrat" value={emp.contractEndDate} />
            <InfoRow label="Salaire" value={emp.salary ? `${emp.salary.toLocaleString()} FCFA` : undefined} />
            <InfoRow label="Fréquence" value={emp.salaryFrequency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Urgence & Banque</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Contact urgence" value={emp.emergencyContactName} />
            <InfoRow label="Tél. urgence" value={emp.emergencyContactPhone} />
            <Separator className="my-2" />
            <InfoRow label="Banque" value={emp.bankName} />
            <InfoRow label="Compte" value={emp.bankAccount} />
            <InfoRow label="Sécurité sociale" value={emp.socialSecurityNumber} />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks"><ClipboardList className="mr-1.5 h-4 w-4" /> Tâches ({tasks.length})</TabsTrigger>
          <TabsTrigger value="attendance"><CalendarCheck className="mr-1.5 h-4 w-4" /> Présences ({attendance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune tâche assignée</p></div>
          ) : (
            <div className="space-y-2">
              {tasks.map((t: any) => {
                const status = taskStatusLabels[t.status] ?? { label: t.status, className: "" };
                return (
                  <div key={t.id} className={`flex items-center justify-between rounded-lg border p-3 ${t.isOverdue ? "bg-red-50/50 border-red-200" : ""}`}>
                    <div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.dueDate ? `Échéance: ${t.dueDate}` : "Sans échéance"}</p></div>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          {attendance.length === 0 ? (
            <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune présence enregistrée</p></div>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground"><span>Date</span><span>Arrivée</span><span>Départ</span><span>Heures</span><span>Statut</span></div>
              {attendance.map((a: any) => {
                const status = attendanceLabels[a.status] ?? { label: a.status, className: "" };
                return (
                  <div key={a.id} className="grid grid-cols-5 gap-4 p-3 border-b last:border-0 text-sm">
                    <span>{a.attendanceDate}</span>
                    <span className="text-muted-foreground">{a.checkInTime ?? "—"}</span>
                    <span className="text-muted-foreground">{a.checkOutTime ?? "—"}</span>
                    <span>{a.actualHours ?? "—"}{a.overtimeHours ? <span className="text-orange-600 ml-1">(+{a.overtimeHours}h sup.)</span> : ""}</span>
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
