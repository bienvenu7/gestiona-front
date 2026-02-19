"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box, Eye, EyeOff } from "lucide-react";
import { ICreateCompanyWithUser } from "@/types/company";
import { useCreateCompany } from "@/hooks/useAuthentication";

export default function RegisterPage() {
  const { createCompanyAsync, isPending, message, error } = useCreateCompany();

  const [showPassword, setShowPassword] = useState(false);

  const [registerDta, setRegisterDta] = useState<ICreateCompanyWithUser>({
    name: "",
    user: { email: "", password: "", name: "" },
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCompanyAsync(registerDta).then(() =>
      router.push(`/otp?email=${registerDta.user.email}`),
    );
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl btn-gradient shadow-lg">
            <Box className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            GESTIONA
          </h1>
          <p className="text-sm text-muted-foreground">
            {"Cr\u00e9ez votre compte professionnel"}
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-xl font-semibold text-foreground">
              {"Cr\u00e9er un compte"}
            </CardTitle>
            <CardDescription>
              {"Remplissez vos informations pour commencer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">{"Nom de l'entreprise"}</Label>
                <Input
                  id="company"
                  placeholder="GESTIONA SARL"
                  required
                  value={registerDta.name}
                  onChange={(e) =>
                    setRegisterDta({ ...registerDta, name: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  required
                  value={registerDta.user.email}
                  onChange={(e) =>
                    setRegisterDta({
                      ...registerDta,
                      user: { ...registerDta.user, email: e.target.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">{"Nom d'utilisateur"}</Label>
                <Input
                  id="username"
                  placeholder="alexjohnson"
                  required
                  value={registerDta.user.name}
                  onChange={(e) =>
                    setRegisterDta({
                      ...registerDta,
                      user: { ...registerDta.user, name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      "Cr\u00e9ez un mot de passe s\u00e9curis\u00e9"
                    }
                    required
                    value={registerDta.user.password}
                    onChange={(e) =>
                      setRegisterDta({
                        ...registerDta,
                        user: { ...registerDta.user, password: e.target.value },
                      })
                    }
                  />
                  {message && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      {message?.message}
                    </p>
                  )}
                  {error && (
                    <p className="mt-4 text-center text-sm text-red-600">
                      {error.message}
                    </p>
                  )}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 h-10 w-full rounded-lg btn-gradient text-sm font-medium"
                disabled={isPending}
              >
                {isPending
                  ? "Cr\u00e9ation en cours..."
                  : "Cr\u00e9er le compte"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {"Vous avez d\u00e9j\u00e0 un compte ? "}
              <Link href="/login" className="link-gradient font-medium">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
