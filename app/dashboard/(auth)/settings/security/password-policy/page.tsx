"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateMeta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const passwordPolicySchema = z.object({
  minLength: z.coerce
    .number()
    .min(6, { message: "La longueur minimale doit être d'au moins 6 caractères" })
    .max(128, { message: "La longueur minimale ne peut pas dépasser 128 caractères" }),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  preventCommonPasswords: z.boolean(),
  preventUserInfo: z.boolean(),
  expirationDays: z.coerce
    .number()
    .min(0, { message: "Le nombre de jours doit être positif" })
    .max(365, { message: "Le nombre de jours ne peut pas dépasser 365" }),
  passwordHistory: z.coerce
    .number()
    .min(0, { message: "Le nombre doit être positif" })
    .max(24, { message: "L'historique ne peut pas dépasser 24 mots de passe" }),
  maxFailedAttempts: z.coerce
    .number()
    .min(3, { message: "Le nombre minimum de tentatives est 3" })
    .max(20, { message: "Le nombre maximum de tentatives est 20" }),
  lockoutDuration: z.coerce
    .number()
    .min(5, { message: "La durée minimale est de 5 minutes" })
    .max(1440, { message: "La durée maximale est de 1440 minutes (24h)" })
});

type PasswordPolicyFormValues = z.infer<typeof passwordPolicySchema>;

const defaultValues: PasswordPolicyFormValues = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
  expirationDays: 90,
  passwordHistory: 5,
  maxFailedAttempts: 5,
  lockoutDuration: 30
};

export default function Page() {
  const form = useForm<PasswordPolicyFormValues>({
    resolver: zodResolver(passwordPolicySchema),
    defaultValues
  });

  function onSubmit(data: PasswordPolicyFormValues) {
    toast({
      title: "Politiques de mot de passe mises à jour",
      description: "Les nouvelles règles de mot de passe ont été appliquées avec succès."
    });
    console.log(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Politiques de mot de passe</h1>
        <p className="text-muted-foreground">
          Configurez les règles de sécurité pour les mots de passe des utilisateurs AvePay
        </p>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exigences de complexité</CardTitle>
              <CardDescription>
                Définissez les critères minimaux que les mots de passe doivent respecter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="minLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longueur minimale</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre minimum de caractères requis (recommandé : 12-16)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireUppercase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Majuscules requises</FormLabel>
                      <FormDescription>
                        Le mot de passe doit contenir au moins une lettre majuscule (A-Z)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireLowercase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Minuscules requises</FormLabel>
                      <FormDescription>
                        Le mot de passe doit contenir au moins une lettre minuscule (a-z)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireNumbers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Chiffres requis</FormLabel>
                      <FormDescription>
                        Le mot de passe doit contenir au moins un chiffre (0-9)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireSpecialChars"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Caractères spéciaux requis</FormLabel>
                      <FormDescription>
                        Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protections avancées</CardTitle>
              <CardDescription>
                Protégez contre les mots de passe faibles et les attaques courantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="preventCommonPasswords"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bloquer les mots de passe courants</FormLabel>
                      <FormDescription>
                        Empêcher l'utilisation de mots de passe couramment compromis (ex: "password123")
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preventUserInfo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bloquer les informations personnelles</FormLabel>
                      <FormDescription>
                        Empêcher l'utilisation du nom, email ou date de naissance dans le mot de passe
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Renouvellement et historique</CardTitle>
              <CardDescription>
                Gérez la durée de vie et l'historique des mots de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="expirationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration du mot de passe (jours)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="90" {...field} />
                    </FormControl>
                    <FormDescription>
                      Forcer le changement de mot de passe après ce nombre de jours (0 = jamais)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historique des mots de passe</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Empêcher la réutilisation des N derniers mots de passe (0 = désactivé)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protection contre les attaques par force brute</CardTitle>
              <CardDescription>
                Configurez les limites de tentatives de connexion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="maxFailedAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tentatives échouées maximales</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre de tentatives de connexion échouées avant verrouillage du compte
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lockoutDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée du verrouillage (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormDescription>
                      Durée pendant laquelle le compte reste verrouillé après trop de tentatives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Réinitialiser
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}