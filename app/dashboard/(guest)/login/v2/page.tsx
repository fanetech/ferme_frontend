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
import { Loader2, Eye, EyeOff, Sprout, BarChart3, Users, Package } from "lucide-react";
import { useLoginMutation } from "@/data/auth";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

const WEST_AFRICA_ISO: CountryCode[] = ["BF", "CI", "ML", "NE", "SN", "TG", "BJ", "GH", "NG", "CM"];

const displayNames = new Intl.DisplayNames(["fr"], { type: "region" });

const getFlagEmoji = (iso: string) =>
  iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");

const COUNTRY_CODES = WEST_AFRICA_ISO.map((iso) => ({
  code: `${getCountryCallingCode(iso)}`,
  country: displayNames.of(iso) ?? iso,
  flag: getFlagEmoji(iso),
}));

const loginSchema = z.object({
  countryCode: z.string().min(1),
  localNumber: z
    .string()
    .min(6, "Numéro trop court")
    .max(12, "Numéro trop long")
    .regex(/^\d+$/, "Chiffres uniquement"),
  password: z
    .string()
    .min(1, "Mot de passe obligatoire")
    .min(6, "Au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: Sprout, label: "Cultures & Parcelles", desc: "Suivi complet de vos récoltes" },
  { icon: Users, label: "Élevage & RH", desc: "Gestion du bétail et des employés" },
  { icon: Package, label: "Inventaire", desc: "Stock et produits en temps réel" },
  { icon: BarChart3, label: "Marketplace", desc: "Ventes et commandes simplifiées" },
];

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { countryCode: "226", localNumber: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    loginMutation.mutate({
      phoneNumber: `+${data.countryCode}${data.localNumber}`,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL — branding ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-12 overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-3xl" />

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

        {/* Main text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Gérez votre ferme
              <br />
              <span className="text-amber-400">intelligemment</span>
            </h1>
            <p className="mt-4 text-green-200 text-base leading-relaxed max-w-sm">
              La plateforme tout-en-un pour les agriculteurs du Burkina Faso
              et de l'Afrique de l'Ouest.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10"
              >
                <div className="mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/20 shrink-0">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-green-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-green-400 text-xs">© 2026 AvePLUS — Burkina Faso</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-12">

        {/* Mobile logo */}
        <div className="flex lg:hidden flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 text-3xl mb-3">
            🌾
          </div>
          <p className="font-bold text-green-800 text-lg">AvePLUS</p>
          <p className="text-muted-foreground text-sm">Farm Management</p>
        </div>

        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bienvenue ! Entrez vos identifiants.
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
                          <Select value={field.value} onValueChange={field.onChange} disabled={loginMutation.isPending}>
                            <SelectTrigger className="h-11 bg-white border-gray-200 font-mono text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_CODES.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{c.flag}</span>
                                    <span className="font-mono">+{c.code}</span>
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
                            disabled={loginMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700">Mot de passe</FormLabel>
                      <Link
                        href="/dashboard/forgot-password"
                        className="text-xs text-green-600 hover:text-green-700 hover:underline"
                      >
                        Oublié ?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="h-11 bg-white border-gray-200 pr-11"
                          disabled={loginMutation.isPending}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold mt-2"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 AvePLUS — Farm Management
          </p>
        </div>
      </div>
    </div>
  );
}
