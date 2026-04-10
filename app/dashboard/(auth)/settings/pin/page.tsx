"use client";

import { useState } from "react";
import { ArrowLeft, Key } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { farmClient } from "@/data/client";

const setPinSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe est obligatoire"),
  pinCode: z.string().min(4, "4 à 6 chiffres").max(6).regex(/^\d+$/, "Chiffres uniquement"),
  confirmPinCode: z.string().min(1, "Confirmez le PIN"),
}).refine((d) => d.pinCode === d.confirmPinCode, { message: "Les PINs ne correspondent pas", path: ["confirmPinCode"] });

const updatePinSchema = z.object({
  oldPinCode: z.string().min(4, "PIN actuel requis"),
  newPinCode: z.string().min(4, "4 à 6 chiffres").max(6).regex(/^\d+$/, "Chiffres uniquement"),
  confirmPinCode: z.string().min(1, "Confirmez le PIN"),
}).refine((d) => d.newPinCode === d.confirmPinCode, { message: "Les PINs ne correspondent pas", path: ["confirmPinCode"] });

export default function PinPage() {
  const [mode, setMode] = useState<"set" | "update">("set");
  const [loading, setLoading] = useState(false);

  const setForm = useForm<z.infer<typeof setPinSchema>>({ resolver: zodResolver(setPinSchema), defaultValues: { currentPassword: "", pinCode: "", confirmPinCode: "" } });
  const updateForm = useForm<z.infer<typeof updatePinSchema>>({ resolver: zodResolver(updatePinSchema), defaultValues: { oldPinCode: "", newPinCode: "", confirmPinCode: "" } });

  const handleSetPin = async (data: z.infer<typeof setPinSchema>) => {
    setLoading(true);
    try {
      await farmClient.auth.setPin({ pin: data.pinCode, password: data.currentPassword });
      toast.success("PIN défini avec succès");
      setForm.reset();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Erreur"); }
    finally { setLoading(false); }
  };

  const handleUpdatePin = async (data: z.infer<typeof updatePinSchema>) => {
    setLoading(true);
    try {
      await farmClient.auth.updatePin({ currentPin: data.oldPinCode, newPin: data.newPinCode });
      toast.success("PIN mis à jour");
      updateForm.reset();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Erreur"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/settings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Key className="h-6 w-6 text-purple-600" /> Code PIN</h1>
          <p className="text-muted-foreground">Gérer votre code PIN de connexion rapide</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={mode === "set" ? "default" : "outline"} size="sm" onClick={() => setMode("set")}>Définir un PIN</Button>
        <Button variant={mode === "update" ? "default" : "outline"} size="sm" onClick={() => setMode("update")}>Modifier le PIN</Button>
      </div>

      {mode === "set" ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Définir un code PIN</CardTitle>
            <CardDescription>Entrez votre mot de passe puis choisissez un code PIN de 4 à 6 chiffres</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...setForm}>
              <form onSubmit={setForm.handleSubmit(handleSetPin)} className="space-y-4">
                <FormField control={setForm.control} name="currentPassword" render={({ field }) => (
                  <FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><Input type="password" placeholder="Votre mot de passe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={setForm.control} name="pinCode" render={({ field }) => (
                  <FormItem><FormLabel>Code PIN</FormLabel><FormControl><Input type="password" maxLength={6} placeholder="1234" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={setForm.control} name="confirmPinCode" render={({ field }) => (
                  <FormItem><FormLabel>Confirmer le PIN</FormLabel><FormControl><Input type="password" maxLength={6} placeholder="1234" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Définir le PIN
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Modifier le code PIN</CardTitle>
            <CardDescription>Entrez votre PIN actuel puis choisissez un nouveau PIN</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdatePin)} className="space-y-4">
                <FormField control={updateForm.control} name="oldPinCode" render={({ field }) => (
                  <FormItem><FormLabel>PIN actuel</FormLabel><FormControl><Input type="password" maxLength={6} placeholder="PIN actuel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={updateForm.control} name="newPinCode" render={({ field }) => (
                  <FormItem><FormLabel>Nouveau PIN</FormLabel><FormControl><Input type="password" maxLength={6} placeholder="Nouveau PIN" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={updateForm.control} name="confirmPinCode" render={({ field }) => (
                  <FormItem><FormLabel>Confirmer</FormLabel><FormControl><Input type="password" maxLength={6} placeholder="Confirmer" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Modifier le PIN
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
