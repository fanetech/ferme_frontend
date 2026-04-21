"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, ArrowLeft, MessageSquare, ShieldCheck, RefreshCw } from "lucide-react";
import { useForgotPasswordMutation } from "@/data/auth";
import { AUTH_ROUTES } from "@/lib/constants/routes";

const COUNTRY_CODES = [
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Bénin", flag: "🇧🇯" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+237", country: "Cameroun", flag: "🇨🇲" },
];

const schema = z.object({
  countryCode: z.string().min(1),
  localNumber: z
    .string()
    .min(6, "Numéro trop court")
    .max(12, "Numéro trop long")
    .regex(/^\d+$/, "Chiffres uniquement"),
});

type FormData = z.infer<typeof schema>;

const steps = [
  { icon: MessageSquare, label: "Saisir votre numéro" },
  { icon: ShieldCheck, label: "Recevoir le code SMS" },
  { icon: RefreshCw, label: "Réinitialiser" },
];

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fullNumber, setFullNumber] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { countryCode: "+226", localNumber: "" },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const phone = `${data.countryCode}${data.localNumber}`;
    setFullNumber(phone);
    forgotPasswordMutation.mutate(phone, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-12 overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-2xl">
              🌾
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">AvePLUS</p>
              <p className="text-green-300 text-xs">Farm Management</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Retrouvez
              <br />
              <span className="text-amber-400">votre accès</span>
            </h1>
            <p className="mt-4 text-green-200 text-base leading-relaxed max-w-sm">
              En 3 étapes simples, réinitialisez votre mot de passe
              et reprenez le contrôle de votre ferme.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/30 shrink-0">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <p className="text-white text-sm">{label}</p>
                {i < steps.length - 1 && (
                  <div className="absolute left-[67px] mt-9 w-px h-3 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-green-400 text-xs">© 2026 AvePLUS — Burkina Faso</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">

        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 text-3xl mb-3">
            🌾
          </div>
          <p className="font-bold text-green-800 text-lg">AvePLUS</p>
        </div>

        <div className="w-full max-w-sm">

          {!submitted ? (
            <>
              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Entrez votre numéro pour recevoir un code SMS.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">Numéro de téléphone</p>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="w-[130px] shrink-0">
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange} disabled={forgotPasswordMutation.isPending}>
                                <SelectTrigger className="h-11 bg-white border-gray-200 font-mono text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRY_CODES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                      <span className="flex items-center gap-2">
                                        <span>{c.flag}</span>
                                        <span className="font-mono">{c.code}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="localNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="tel"
                                inputMode="numeric"
                                placeholder="70 00 00 00"
                                className="h-11 bg-white border-gray-200 font-mono tracking-wider"
                                disabled={forgotPasswordMutation.isPending}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.watch("localNumber") && (
                      <p className="text-xs text-muted-foreground pl-1">
                        Numéro complet :{" "}
                        <span className="font-mono font-medium text-gray-700">
                          {form.watch("countryCode")}{form.watch("localNumber")}
                        </span>
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-green-600 hover:bg-green-700 font-semibold"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le code SMS"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <Link
                  href={AUTH_ROUTES.LOGIN_V2}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Code envoyé !</h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  Un code de réinitialisation a été envoyé au
                </p>
                <p className="font-mono font-semibold text-gray-800 mt-1">{fullNumber}</p>
                <p className="text-muted-foreground text-sm mt-1">Vérifiez vos SMS.</p>
              </div>

              <div className="space-y-3 pt-2">
                <Link href={AUTH_ROUTES.LOGIN_V2} className="block">
                  <Button className="w-full h-11 bg-green-600 hover:bg-green-700 font-semibold">
                    Retour à la connexion
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full h-11 text-muted-foreground hover:text-gray-700"
                  onClick={() => setSubmitted(false)}
                >
                  Utiliser un autre numéro
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-10">
            © 2026 AvePLUS — Farm Management
          </p>
        </div>
      </div>
    </div>
  );
}
