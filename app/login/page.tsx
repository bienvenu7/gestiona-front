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
import { useLoginUser } from "@/hooks/useAuthentication";

export default function LoginPage() {
  const { error, isPending, loginUserFn, message } = useLoginUser();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await loginUserFn({ email, password }).then(() =>
      router.push(`/otp?email=${email}`),
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
            INVENTERA
          </h1>
          <p className="text-sm text-muted-foreground">
            {"La gestion des stocks simplifi\u00e9e"}
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-xl font-semibold text-foreground">
              {"Bon retour parmi nous"}
            </CardTitle>
            <CardDescription>
              {"Connectez-vous \u00e0 votre compte pour continuer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="#" className="text-xs link-gradient font-medium">
                    {"Mot de passe oubli\u00e9 ?"}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
                type="submit"
                className="mt-2 h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {isPending ? "En cours de connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {"Vous n'avez pas de compte ? "}
              <Link href="/register" className="link-gradient font-medium">
                {"S'inscrire"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
