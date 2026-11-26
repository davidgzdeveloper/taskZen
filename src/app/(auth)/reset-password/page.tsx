"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar la contraseña.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div>
        <h1 className="text-4xl font-extrabold">Enlace incompleto</h1>
        <p className="mt-3 text-muted-foreground">
          Abre el enlace directamente desde el correo de recuperación, o pide uno nuevo.
        </p>
        <Button asChild className="mt-8 h-11">
          <Link href="/forgot-password">Pedir un enlace nuevo</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <CheckCircle2 className="h-8 w-8 text-done" aria-hidden />
        <h1 className="mt-4 text-4xl font-extrabold">Contraseña actualizada</h1>
        <p className="mt-3 text-muted-foreground">Ya puedes iniciar sesión con tu contraseña nueva.</p>
        <Button asChild className="mt-8 h-11 w-full text-base">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  const expired = error?.includes("caducado");

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Contraseña nueva</h1>
      <p className="mt-2 text-muted-foreground">Al menos 6 caracteres.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña nueva</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">Repite la contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}{" "}
            {expired && (
              <Link href="/forgot-password" className="font-medium underline underline-offset-4">
                Pedir un enlace nuevo
              </Link>
            )}
          </p>
        )}
        <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
