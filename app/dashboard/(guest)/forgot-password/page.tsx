"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import { useForgotPasswordMutation } from "@/data/auth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { AUTH_ROUTES } from "@/lib/constants/routes";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = (data) => {
    forgotPasswordMutation.mutate(data.phoneNumber, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-8 lg:py-12">
      <div className="w-full max-w-xl px-4">
        {/* Logo / App name */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 mb-4">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-green-800">Farm Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion agricole — Burkina Faso</p>
        </div>

        <Card className="mx-auto w-full">
          {!submitted ? (
            <>
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
                <CardDescription>
                  Entrez votre numéro de téléphone pour recevoir un code de réinitialisation par SMS.
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de téléphone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="tel"
                                autoComplete="tel"
                                className="pl-11 h-11"
                                placeholder="+226 XX XX XX XX"
                                disabled={forgotPasswordMutation.isPending}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 bg-green-600 hover:bg-green-700"
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le code"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex justify-center pb-6">
                <p className="text-sm text-muted-foreground">
                  Retour à la{" "}
                  <Link href={AUTH_ROUTES.LOGIN_V2} className="text-green-600 underline">
                    connexion
                  </Link>
                </p>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="space-y-2 pb-6">
                <div className="flex justify-center mb-2">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-center">Code envoyé !</CardTitle>
                <CardDescription className="text-center">
                  Un code de réinitialisation a été envoyé au numéro{" "}
                  <span className="font-medium text-foreground">{form.getValues("phoneNumber")}</span>.
                  Vérifiez vos SMS.
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex flex-col gap-3 pb-6">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => setSubmitted(false)}
                >
                  Utiliser un autre numéro
                </Button>
                <Link href={AUTH_ROUTES.LOGIN_V2} className="w-full">
                  <Button className="w-full h-11 bg-green-600 hover:bg-green-700">
                    Retour à la connexion
                  </Button>
                </Link>
              </CardFooter>
            </>
          )}
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Farm Management — AvePLUS
          </p>
        </div>
      </div>
    </div>
  );
}
