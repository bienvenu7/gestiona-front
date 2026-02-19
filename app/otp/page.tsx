"use client";

import React, { useEffect } from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Box, ShieldCheck } from "lucide-react";
import { useCheckOtp } from "@/hooks/useAuthentication";

export default function OTPPage() {
  const { checkOtpFn, error, isPending } = useCheckOtp();

  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await checkOtpFn({ email: email!, code: otp }).then(
      () => (window.location.pathname = "/dashboard"),
    );
  };

  useEffect(() => {
    if (email === null) {
      return router.push("/");
    }
  }, [email]);

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
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldCheck className="h-6 w-6 link-gradient" />
            </div>
            <CardTitle className="font-heading text-xl font-semibold text-foreground">
              {"V\u00e9rifiez votre identit\u00e9"}
            </CardTitle>
            <CardDescription>
              {
                "Nous avons envoy\u00e9 un code \u00e0 6 chiffres \u00e0 votre adresse e-mail. Saisissez-le ci-dessous pour continuer."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-6"
            >
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {error && (
                <p className="mt-4 text-center text-sm text-red-600">
                  {error.message}
                </p>
              )}
              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {isPending
                  ? "Verification en cours..."
                  : "V\u00e9rifier et continuer"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {"Vous n'avez pas re\u00e7u de code ? "}
              <button type="button" className="link-gradient font-medium">
                Renvoyer
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
